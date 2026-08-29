import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { indexDocument, lexicalToText, removeDocument } from '../lib/embeddings'

/**
 * Keep the vector index in step with the CMS.
 *
 * Indexing runs after the response is sent rather than blocking the save, so a
 * slow or failing embedding call never stops the client publishing. A failure
 * logs and leaves the article unindexed; the backfill script picks it up.
 */
export const indexOnChange: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
  operation,
}) => {
  const run = async () => {
    try {
      // Drafts and unpublished work stay out of search.
      if (doc._status && doc._status !== 'published') {
        await removeDocument(collection.slug, doc.id)
        return
      }

      const body = doc.body ?? doc.commentary ?? doc.outlook
      const parts = [
        doc.standfirst,
        doc.aiSummary,
        doc.summary,
        doc.impactNote,
        body ? lexicalToText(body) : '',
        doc.keyStocks?.map((k: any) => `${k.name} ${k.ticker ?? ''} ${k.note ?? ''}`).join('. '),
      ].filter(Boolean)

      // Flow figures are meaningless as prose but very useful as retrievable
      // facts, so they are written out in words alongside the article text.
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
          .map(([label, v]) => `${label}: ${v > 0 ? '+' : ''}${v} (${v > 0 ? 'net buying' : v < 0 ? 'net selling' : 'flat'})`)
        if (described.length) {
          parts.push(
            `Flow indicators for ${doc.stockName ?? doc.title}${doc.ticker ? ` (${doc.ticker})` : ''}, measured over ${f.basis ?? 'the stated period'}: ${described.join('; ')}.`,
          )
        }
      }

      const text = parts.join('\n\n')
      if (!text.trim()) return

      const section =
        typeof doc.section === 'object' ? doc.section?.title : undefined

      const n = await indexDocument({
        collection: collection.slug,
        docId: doc.id,
        slug: doc.slug,
        title: doc.title,
        sectionTitle: section ?? null,
        publishedAt: doc.publishedAt ?? null,
        text,
      })

      req.payload.logger.info(`[search] indexed ${collection.slug}/${doc.slug} (${n} chunks)`)
    } catch (err) {
      req.payload.logger.error(
        `[search] failed to index ${collection.slug}/${doc.id}: ${(err as Error).message}`,
      )
    }
  }

  if (operation === 'create' || operation === 'update') {
    // Fire and forget. Publishing must not wait on OpenAI.
    void run()
  }

  return doc
}

export const deindexOnDelete: CollectionAfterDeleteHook = async ({ doc, collection, req }) => {
  try {
    await removeDocument(collection.slug, doc.id)
  } catch (err) {
    req.payload.logger.error(`[search] failed to de-index: ${(err as Error).message}`)
  }
  return doc
}
