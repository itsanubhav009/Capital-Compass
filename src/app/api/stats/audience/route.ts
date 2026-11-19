import type { NextRequest } from 'next/server'
import { client } from '@/lib/queries'
import { vectorPool } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

/**
 * Audience numbers for the admin dashboard, from the tables /api/view fills.
 *
 * "Today" and the daily series follow India time, where the readers are, not
 * the server's UTC: a day that ended at 5:30 in the morning would read wrong.
 *
 * Requires a logged-in user.
 */

const TZ = 'Asia/Kolkata'

export async function GET(req: NextRequest) {
  const payload = await client()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return Response.json({ error: 'Sign in to the admin panel first.' }, { status: 403 })

  const db = vectorPool()
  const today = `date_trunc('day', now() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}'`

  try {
    const [totals, daily, articles] = await Promise.all([
      db.query(`
        SELECT
          (SELECT count(*) FROM visitors)::int                                              AS all_time,
          (SELECT count(*) FROM visitors WHERE first_seen >= ${today})::int                 AS new_today,
          (SELECT count(*) FROM visitors WHERE first_seen >= now() - interval '30 days')::int AS new_30d,
          (SELECT count(DISTINCT visitor_id) FROM page_views WHERE at >= ${today})::int     AS unique_today,
          (SELECT count(DISTINCT visitor_id) FROM page_views WHERE at >= now() - interval '7 days')::int  AS unique_7d,
          (SELECT count(DISTINCT visitor_id) FROM page_views WHERE at >= now() - interval '30 days')::int AS unique_30d,
          (SELECT count(*) FROM page_views WHERE at >= now() - interval '30 days')::int     AS views_30d,
          (SELECT min(first_seen) FROM visitors)                                            AS counting_since`),
      db.query(`
        SELECT to_char(date_trunc('day', at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS day,
               count(DISTINCT visitor_id)::int AS visitors,
               count(*)::int AS views
          FROM page_views
         WHERE at >= now() - interval '14 days'
         GROUP BY 1 ORDER BY 1`),
      db.query(`
        SELECT r.article_slug AS slug, a.title, count(*)::int AS readers
          FROM article_reads r LEFT JOIN articles a ON a.slug = r.article_slug
         WHERE r.at >= now() - interval '30 days'
         GROUP BY r.article_slug, a.title
         ORDER BY readers DESC LIMIT 8`),
    ])
    return Response.json({ totals: totals.rows[0], daily: daily.rows, articles: articles.rows })
  } catch (err: any) {
    // Before the migration has run, the tables do not exist yet.
    if (/relation .* does not exist/.test(String(err?.message))) {
      return Response.json({ error: 'Counting has not started: the unique_views migration has not been applied.' }, { status: 503 })
    }
    console.error('[audience] stats failed', err)
    return Response.json({ error: 'Could not read the numbers.' }, { status: 500 })
  }
}
