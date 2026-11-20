import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { vectorPool } from '@/lib/embeddings'
import { budget, fingerprintConfig, recordCall, verify } from '@/lib/fingerprint'

export const dynamic = 'force-dynamic'

/**
 * Records one page view and counts unique visitors.
 *
 * The visitor ID lives in two places, so losing one does not make a returning
 * reader new: a cookie this route sets, and a copy in localStorage that the
 * page sends (components/visitor-tracker.tsx). The cookie wins when both
 * exist. It is set here, by the server, because Safari deletes cookies a
 * page's script sets after seven days; ones set by the site's own server it
 * keeps.
 *
 * A visitor with neither copy — new, in a private window, or having cleared
 * cookies — is where a cookie alone would count a returning reader twice.
 * When Fingerprint is configured, the reader has accepted analytics and the
 * month's calls are not used up, the page is asked to identify the device
 * with Fingerprint and send the result back. That result is checked with
 * Fingerprint's Server API, so nobody can post invented IDs, and matched to a
 * visitor already known by that Fingerprint ID. Otherwise the visitor gets a
 * new cookie ID, and the hit says why: no-consent, blocked or over-limit.
 *
 *   1. Known bots and crawlers are dropped, by User-Agent (and by
 *      Fingerprint's bot detection, when it is used).
 *   2. The ID is inserted into `visitors`. Its primary key, and the unique
 *      index on the Fingerprint ID, are what make a visitor count once, even
 *      when two first views arrive together.
 *   3. Every hit goes into `page_views`, the raw log, with how its visitor
 *      was identified, so the method can change and history be recounted.
 *   4. On an article, the first read by this visitor goes into
 *      `article_reads` and adds one to the article's `views` — so that number
 *      is readers, not page loads.
 *
 * Plain SQL rather than payload.update: an update would write a version row,
 * fire the search-index hook and re-embed the article on every page view.
 *
 * It counts browsers on devices, not people: a reader on a phone and a laptop
 * is two.
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

type Source = 'cookie' | 'fingerprint' | 'fingerprint-match' | 'no-consent' | 'blocked' | 'over-limit' | 'unverified'

export async function POST(req: Request) {
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT.test(ua)) return NextResponse.json({ ok: true, counted: false })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const path = clip(body?.path, 512)
  if (!path || !path.startsWith('/')) return NextResponse.json({ ok: false }, { status: 400 })
  const slug = /^\/insight\/([a-z0-9-]+)\/?$/i.exec(path)?.[1]?.slice(0, 255) ?? null
  // Only another site's address is worth keeping as a referrer.
  const ref = clip(body?.referrer, 512)
  const referrer = ref && !/smartmoneyexpress\.com|vercel\.app|localhost/.test(ref) ? ref : null

  const fromCookie = cookieId(req)
  const known = ID.test(fromCookie) ? fromCookie : ID.test(String(body?.vid ?? '')) ? String(body.vid) : null

  try {
    const db = vectorPool()
    let id: string
    let isNew: boolean
    let source: Source

    if (known) {
      const v = await db.query(
        `INSERT INTO visitors (id) VALUES ($1)
           ON CONFLICT (id) DO UPDATE SET last_seen = now()
         RETURNING (xmax = 0) AS inserted`,
        [known],
      )
      id = known
      isNew = Boolean(v.rows[0]?.inserted)
      source = 'cookie'
    } else if (body?.fp?.requestId && body?.fp?.visitorId) {
      await recordCall()
      const confirmed = await verify(String(body.fp.requestId), String(body.fp.visitorId))
      if (confirmed === 'bot') return NextResponse.json({ ok: true, counted: false })
      if (confirmed) {
        // One statement whether the device is new or known: the unique index
        // on fp_visitor_id decides, and a race between two first views
        // cannot create two visitors.
        const v = await db.query(
          `INSERT INTO visitors (id, fp_visitor_id, source) VALUES ($1, $2, 'fingerprint')
             ON CONFLICT (fp_visitor_id) WHERE fp_visitor_id IS NOT NULL
             DO UPDATE SET last_seen = now()
           RETURNING id, (xmax = 0) AS inserted`,
          [randomUUID(), confirmed],
        )
        id = v.rows[0].id
        isNew = Boolean(v.rows[0].inserted)
        source = isNew ? 'fingerprint' : 'fingerprint-match'
      } else {
        ;({ id, isNew } = await freshVisitor())
        source = 'unverified'
      }
    } else {
      const cfg = fingerprintConfig()
      const fallback = body?.fpFallback === 'no-consent' || body?.fpFallback === 'blocked' ? body.fpFallback : null
      if (cfg && !fallback) {
        const b = await budget()
        if (b.allowed) {
          // Not counted yet: the page identifies the device and asks again.
          return NextResponse.json({
            ok: true,
            counted: false,
            needFingerprint: { publicKey: cfg.publicKey, region: cfg.region, requireConsent: cfg.requireConsent },
          })
        }
        source = 'over-limit'
      } else {
        source = fallback ?? 'cookie'
      }
      ;({ id, isNew } = await freshVisitor())
    }

    await db.query(
      `INSERT INTO page_views (visitor_id, path, article_slug, referrer, new_visitor, id_source) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, path, slug, referrer, isNew, source],
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

async function freshVisitor() {
  const id = randomUUID()
  await vectorPool().query(`INSERT INTO visitors (id) VALUES ($1)`, [id])
  return { id, isNew: true }
}
