import { NextResponse } from 'next/server'
import { vectorPool } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

const COLLECTIONS: Record<string, string> = {
  'smart-money-reports': 'smart_money_reports',
  'macro-notes': 'macro_notes',
  'theme-reports': 'theme_reports',
  'wealth-articles': 'wealth_articles',
}

/**
 * Increment a view count.
 *
 * Raw SQL rather than payload.update because an update would create a version
 * row, fire the search-index hook, and re-embed the article on every page
 * view. A single UPDATE avoids all of that.
 *
 * Deliberately crude: one count per request, no deduplication. It is a
 * popularity signal for readers, not analytics — GA4 is the source of truth
 * for anything that matters.
 */
export async function POST(req: Request) {
  let collection = ''
  let slug = ''
  try {
    const body = await req.json()
    collection = String(body.collection ?? '')
    slug = String(body.slug ?? '').slice(0, 200)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const table = COLLECTIONS[collection]
  if (!table || !slug) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const db = vectorPool()
    await db.query(
      `UPDATE ${table} SET views = COALESCE(views, 0) + 1 WHERE slug = $1`,
      [slug],
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[view] increment failed', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
