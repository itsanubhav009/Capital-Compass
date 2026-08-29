import { getPayload } from 'payload'
import config from '../payload.config'
import { indexDocument, lexicalToText, vectorPool } from '../lib/embeddings'

/**
 * Index every published article.  npm run search:backfill
 *
 * Run once after search:setup, and again any time embeddings drift out of
 * step — for example if the indexing hook failed while OpenAI was down.
 */
const COLLECTIONS = [
  'smart-money-reports',
  'macro-notes',
  'theme-reports',
  'wealth-articles',
] as const

const textFor = (doc: any): string => {
  const body = doc.body ?? doc.commentary ?? doc.outlook
  const parts = [
    doc.standfirst,
    doc.aiSummary,
    doc.summary,
    doc.impactNote,
    body ? lexicalToText(body) : '',
    doc.keyStocks?.map((k: any) => `${k.name} ${k.ticker ?? ''} ${k.note ?? ''}`).join('. '),
  ].filter(Boolean)

  if (doc.flows) {
    const f = doc.flows
    const named: [string, any][] = [
      ['FII flow', f.fii],
      ['DII flow', f.dii],
      ['Promoter flow', f.promoter],
      ['Technical trend', f.technical],
      ['Fundamental trend', f.fundamental],
    ]
    const described = named
      .filter(([, v]) => typeof v === 'number')
      .map(
        ([l, v]) =>
          `${l}: ${v > 0 ? '+' : ''}${v} (${v > 0 ? 'net buying' : v < 0 ? 'net selling' : 'flat'})`,
      )
    if (described.length) {
      parts.push(
        `Flow indicators for ${doc.stockName ?? doc.title}${doc.ticker ? ` (${doc.ticker})` : ''}, measured over ${f.basis ?? 'the stated period'}: ${described.join('; ')}.`,
      )
    }
  }
  return parts.join('\n\n')
}

const run = async () => {
  const payload = await getPayload({ config })
  let docs = 0
  let chunks = 0

  for (const collection of COLLECTIONS) {
    const res = await payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 1,
    })

    for (const doc of res.docs as any[]) {
      const text = textFor(doc)
      if (!text.trim()) {
        console.log(`  skip  ${collection}/${doc.slug} (no text)`)
        continue
      }
      const n = await indexDocument({
        collection,
        docId: doc.id,
        slug: doc.slug,
        title: doc.title,
        sectionTitle: typeof doc.section === 'object' ? doc.section?.title : null,
        publishedAt: doc.publishedAt ?? null,
        text,
      })
      docs += 1
      chunks += n
      console.log(`  index ${collection}/${doc.slug} (${n} chunks)`)
    }
  }

  const { rows } = await vectorPool().query('SELECT count(*)::int AS n FROM content_embeddings')
  console.log(`\n${docs} documents, ${chunks} chunks written. Table now holds ${rows[0].n}.`)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
