import { Pool } from 'pg'

const KEY = process.env.GEMINI_API_KEY
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004'
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

/** text-embedding-004 returns 768 dimensions. Changing model means re-running setup. */
export const EMBED_DIMS = Number(process.env.GEMINI_EMBED_DIMS || 768)

let pool: Pool | null = null

/**
 * A dedicated pool for the vector table.
 *
 * Payload's schema is managed by migrations and does not know about pgvector,
 * so embeddings live in their own table accessed with raw SQL. Modelling a
 * vector column as a Payload field means fighting the schema generator on
 * every migration.
 */
export function vectorPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URI,
      max: process.env.VERCEL ? 2 : 5,
      connectionTimeoutMillis: 30_000,
    })
  }
  return pool
}

/* ------------------------------------------------------------ text extract */

/**
 * Flatten a Lexical richText document to plain text. Inserts breaks at block
 * boundaries so sentences from adjacent paragraphs are not chunked as one
 * thought.
 */
export function lexicalToText(node: any): string {
  if (!node) return ''
  const root = node.root ?? node
  const out: string[] = []

  const walk = (n: any) => {
    if (!n) return
    if (typeof n.text === 'string') {
      out.push(n.text)
      return
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(walk)
      if (['paragraph', 'heading', 'listitem', 'quote'].includes(n.type)) out.push('\n')
    }
  }

  walk(root)
  return out.join(' ').replace(/\s*\n\s*/g, '\n').replace(/[ \t]{2,}/g, ' ').trim()
}

/* ---------------------------------------------------------------- chunking */

const TARGET = 1400
const OVERLAP = 200

export function chunk(text: string): string[] {
  if (!text.trim()) return []
  const paras = text.split('\n').map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const p of paras) {
    if (current && current.length + p.length + 1 > TARGET) {
      chunks.push(current)
      current = current.slice(-OVERLAP) + ' ' + p
    } else {
      current = current ? `${current}\n${p}` : p
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks.flatMap((c) =>
    c.length <= TARGET * 1.5
      ? [c]
      : (c.match(new RegExp(`.{1,${TARGET}}(\\s|$)`, 'g')) ?? [c]).map((s) => s.trim()),
  )
}

/* -------------------------------------------------------------- embeddings */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Gemini batch embeddings.
 *
 * taskType matters more here than it does with OpenAI: documents and queries
 * are embedded into deliberately different spaces, and mismatching them
 * measurably degrades retrieval. Always pass 'document' when indexing and
 * 'query' when searching.
 *
 * The free tier is rate limited, so batches are capped and retried on 429.
 */
export async function embed(
  texts: string[],
  taskType: 'document' | 'query' = 'document',
): Promise<number[][]> {
  if (!KEY) throw new Error('GEMINI_API_KEY is not set')
  if (!texts.length) return []

  const task = taskType === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT'
  const BATCH = 50
  const all: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH)

    let attempt = 0
    while (true) {
      const res = await fetch(
        `${BASE}/models/${EMBED_MODEL}:batchEmbedContents?key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: slice.map((text) => ({
              model: `models/${EMBED_MODEL}`,
              content: { parts: [{ text }] },
              taskType: task,
              // gemini-embedding-001 defaults to 3072 dimensions. Pinning this
              // to match EMBED_DIMS keeps the vector column valid; changing one
              // without the other fails at insert.
              outputDimensionality: EMBED_DIMS,
            })),
          }),
        },
      )

      if (res.ok) {
        const data = await res.json()
        all.push(...data.embeddings.map((e: any) => e.values as number[]))
        break
      }

      // Free tier throttles aggressively. Back off rather than failing the run.
      if (res.status === 429 && attempt < 5) {
        attempt += 1
        await sleep(2000 * attempt)
        continue
      }

      throw new Error(`Gemini embedding failed: ${res.status} ${await res.text()}`)
    }

    if (i + BATCH < texts.length) await sleep(300)
  }

  return all
}

/* ------------------------------------------------------------ index writes */

export type IndexInput = {
  collection: string
  docId: string | number
  slug: string
  title: string
  sectionTitle?: string | null
  publishedAt?: string | null
  text: string
}

/**
 * Replace every chunk for one document. Delete-then-insert rather than
 * diffing: a rewrite invalidates old chunks anyway, and the cost is trivial at
 * one or two posts a day.
 */
export async function indexDocument(input: IndexInput): Promise<number> {
  const db = vectorPool()
  const pieces = chunk(input.text)

  await db.query('DELETE FROM content_embeddings WHERE collection = $1 AND doc_id = $2', [
    input.collection,
    String(input.docId),
  ])

  if (!pieces.length) return 0

  // Prefix each chunk with its title so a chunk retrieved in isolation still
  // carries the context of which company or theme it belongs to.
  const vectors = await embed(
    pieces.map((p) => `${input.title}\n\n${p}`),
    'document',
  )

  for (let i = 0; i < pieces.length; i++) {
    await db.query(
      `INSERT INTO content_embeddings
         (collection, doc_id, slug, title, section_title, published_at, chunk_index, content, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        input.collection,
        String(input.docId),
        input.slug,
        input.title,
        input.sectionTitle ?? null,
        input.publishedAt ?? null,
        i,
        pieces[i],
        JSON.stringify(vectors[i]),
      ],
    )
  }

  return pieces.length
}

export async function removeDocument(collection: string, docId: string | number) {
  const db = vectorPool()
  await db.query('DELETE FROM content_embeddings WHERE collection = $1 AND doc_id = $2', [
    collection,
    String(docId),
  ])
}

/* -------------------------------------------------------------- retrieval */

export type Hit = {
  collection: string
  slug: string
  title: string
  sectionTitle: string | null
  publishedAt: string | null
  content: string
  similarity: number
}

export async function retrieve(query: string, limit = 6): Promise<Hit[]> {
  const db = vectorPool()
  const [vector] = await embed([query], 'query')

  const { rows } = await db.query(
    `SELECT collection, slug, title, section_title, published_at, content,
            1 - (embedding <=> $1::vector) AS similarity
       FROM content_embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
    [JSON.stringify(vector), limit],
  )

  return rows.map((r: any) => ({
    collection: r.collection,
    slug: r.slug,
    title: r.title,
    sectionTitle: r.section_title,
    publishedAt: r.published_at,
    content: r.content,
    similarity: Number(r.similarity),
  }))
}
