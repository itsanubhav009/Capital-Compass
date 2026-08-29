import { vectorPool, EMBED_DIMS } from '../lib/embeddings'

/**
 * One-time database setup for search.  npm run search:setup
 *
 * Creates the pgvector extension and the embeddings table. Kept outside
 * Payload's migrations because Payload's schema generator does not understand
 * vector columns and would try to drop this table on every migrate:create.
 *
 * Safe to re-run.
 */
const run = async () => {
  const db = vectorPool()

  await db.query('CREATE EXTENSION IF NOT EXISTS vector')
  console.log('extension  pgvector')

  await db.query(`
    CREATE TABLE IF NOT EXISTS content_embeddings (
      id            BIGSERIAL PRIMARY KEY,
      collection    TEXT NOT NULL,
      doc_id        TEXT NOT NULL,
      slug          TEXT NOT NULL,
      title         TEXT NOT NULL,
      section_title TEXT,
      published_at  TIMESTAMPTZ,
      chunk_index   INTEGER NOT NULL,
      content       TEXT NOT NULL,
      embedding     vector(${EMBED_DIMS}) NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  console.log('table      content_embeddings')

  await db.query(
    'CREATE INDEX IF NOT EXISTS content_embeddings_doc_idx ON content_embeddings (collection, doc_id)',
  )

  // HNSW with cosine distance. Builds slower than IVFFlat but needs no
  // training pass, which matters when the table starts empty.
  await db.query(`
    CREATE INDEX IF NOT EXISTS content_embeddings_vec_idx
      ON content_embeddings USING hnsw (embedding vector_cosine_ops)
  `)
  console.log('index      hnsw (cosine)')

  const { rows } = await db.query('SELECT count(*)::int AS n FROM content_embeddings')
  console.log(`\nReady. ${rows[0].n} chunks indexed. Run "npm run search:backfill" next.`)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
