import { NextResponse } from 'next/server'
import { vectorPool } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

/**
 * Records one page view and counts unique visitors.
 *
 * The visitor ID lives in two places, so losing one does not make a returning
 * reader new: a cookie this route sets, and a copy in localStorage that the
 * page sends (components/visitor-tracker.tsx). The cookie wins when both
 * exist. It is set here, by the server, because Safari deletes cookies a
 * page's script sets after seven days; ones set by the site's own server it
 * keeps. Here:
 *
 *   1. Known bots and crawlers are dropped, by User-Agent.
 *   2. The ID is inserted into `visitors`. Its primary key is what makes a
 *      visitor count once: two first views arriving together cannot both
 *      insert, so there is no read-then-write race to lose.
 *   3. Every hit goes into `page_views`, the raw log, so the counting method
 *      can change later and the history be recounted.
 *   4. On an article, the first read by this visitor goes into
 *      `article_reads` and adds one to the article's `views` — so that number
 *      is readers, not page loads.
 *
 * Plain SQL rather than payload.update: an update would write a version row,
 * fire the search-index hook and re-embed the article on every page view.
 *
 * It counts browsers on devices, not people: a reader on a phone and a laptop
 * is two. Clearing cookies or a private window makes a new visitor, until the
 * Fingerprint step (phase 2) fills that gap.
 */

const BOT =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|slack|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|okhttp|scrapy|httpclient/i

// crypto.randomUUID() in the browser; anything else was not made by us.
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const clip = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null)

const COOKIE = 'smx_vid'
const TWO_YEARS = 60 * 60 * 24 * 730

const cookieId = (req: Request) =>
  /(?:^|;\s*)smx_vid=([^;]+)/.exec(req.headers.get('cookie') ?? '')?.[1] ?? ''

export async function POST(req: Request) {
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT.test(ua)) return NextResponse.json({ ok: true, counted: false })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const fromCookie = cookieId(req)
  const id = ID.test(fromCookie) ? fromCookie : String(body?.vid ?? '')
  const path = clip(body?.path, 512)
  if (!ID.test(id) || !path || !path.startsWith('/')) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const slug = /^\/insight\/([a-z0-9-]+)\/?$/i.exec(path)?.[1]?.slice(0, 255) ?? null
  // Only another site's address is worth keeping as a referrer.
  const ref = clip(body?.referrer, 512)
  const referrer = ref && !/smartmoneyexpress\.com|vercel\.app|localhost/.test(ref) ? ref : null

  try {
    const db = vectorPool()
    // xmax = 0 only on a freshly inserted row: the cheapest way to learn
    // whether this was the visitor's first view without a second query.
    const v = await db.query(
      `INSERT INTO visitors (id) VALUES ($1)
         ON CONFLICT (id) DO UPDATE SET last_seen = now()
       RETURNING (xmax = 0) AS inserted`,
      [id],
    )
    const isNew = Boolean(v.rows[0]?.inserted)

    await db.query(
      `INSERT INTO page_views (visitor_id, path, article_slug, referrer, new_visitor) VALUES ($1, $2, $3, $4, $5)`,
      [id, path, slug, referrer, isNew],
    )

    if (slug) {
      const r = await db.query(
        `INSERT INTO article_reads (visitor_id, article_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [id, slug],
      )
      if (r.rowCount) {
        await db.query(`UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE slug = $1`, [slug])
      }
    }

    // The ID goes back so the page can keep its copy in step with the cookie.
    const res = NextResponse.json({ ok: true, counted: true, newVisitor: isNew, vid: id })
    res.cookies.set(COOKIE, id, {
      maxAge: TWO_YEARS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
    return res
  } catch (err) {
    console.error('[view] could not record', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
