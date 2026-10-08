import type { NextRequest } from 'next/server'
import { resolveMx } from 'dns/promises'
import { client } from '@/lib/queries'
import { buildArticleEmail, siteUrl, unsubscribeUrl } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
// Each address is a separate SMTP conversation, so the whole run is roughly
// a second per subscriber. The platform default would cut a list of twenty
// off halfway through.
export const maxDuration = 60

/**
 * Emails one article to the subscriber list.
 *
 * Addresses are sent to one at a time rather than in a single message with
 * everyone in BCC. It is slower, but a BCC list is one slip from showing every
 * subscriber's address to every other subscriber, and a per-address send is
 * the only way to say which ones actually went through — which is the point
 * of the log this writes.
 *
 * A failure for one address does not stop the run. The whole value of this is
 * knowing that nineteen arrived and one did not, rather than the request
 * dying on the first bad address and leaving nobody informed.
 *
 * Requires a logged-in user: it puts mail in other people's inboxes.
 */

/** Gmail's daily ceiling is ~500 on a free account, ~2,000 on Workspace. */
const CEILING = 400

/**
 * Does this address's domain accept mail at all?
 *
 * Worth the DNS lookup because of what SMTP does not tell us. Gmail accepts
 * almost every message the moment it is offered and works out deliverability
 * afterwards, bouncing in a separate email hours later that nothing here can
 * see. So "the mail server took it" is the strongest claim a send can make,
 * and on its own that would have reported five addresses at example.com —
 * a domain reserved precisely so it can never receive mail — as successes.
 *
 * An MX lookup catches exactly that: typos, made-up domains and test data.
 * It cannot catch a real domain with no such mailbox, which still bounces
 * silently. Results are cached per run so a list sharing a domain costs one
 * lookup, not one per subscriber.
 */
const mxCache = new Map<string, boolean>()
async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  if (mxCache.has(domain)) return mxCache.get(domain)!
  let ok = false
  try {
    const records = await resolveMx(domain)
    // A single MX with an empty exchange is RFC 7505's "null MX": the domain
    // is declaring that it accepts no mail at all. example.com publishes one,
    // which is why counting the records alone was not enough — five seeded
    // test addresses sailed through as successes.
    ok = records.some((r) => typeof r.exchange === 'string' && r.exchange.trim().length > 0)
  } catch {
    // NXDOMAIN, no MX record, or DNS trouble. Treated as undeliverable, which
    // is right for the first two; a DNS outage would make this cautious
    // rather than wrong, and the reason given says what was checked.
    ok = false
  }
  mxCache.set(domain, ok)
  return ok
}

const reason = (err: any): string => {
  const msg = String(err?.message ?? err)
  const code = err?.code ?? err?.responseCode
  if (code === 'EAUTH' || code === 535) return 'Mail server rejected our login'
  if (/550|no such user|does not exist|recipient/i.test(msg)) return 'Address does not exist'
  if (/5\.4\.5|quota|limit exceeded/i.test(msg)) return 'Daily sending limit reached'
  if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED') return 'Could not reach the mail server'
  return msg.slice(0, 180)
}

export async function POST(req: NextRequest) {
  const payload = await client()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return Response.json({ error: 'Sign in to the admin panel first.' }, { status: 403 })
  }

  if (!process.env.SMTP_HOST) {
    return Response.json(
      {
        error:
          'Email is not configured in this environment, so nothing would be sent. Check /api/email-health.',
      },
      { status: 503 },
    )
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Could not read the request.' }, { status: 400 })
  }

  const articleId = body?.articleId
  if (!articleId) return Response.json({ error: 'No article given.' }, { status: 400 })

  let article: any
  try {
    article = await payload.findByID({ collection: 'articles', id: articleId, depth: 1 })
  } catch {
    return Response.json({ error: 'That article no longer exists.' }, { status: 404 })
  }
  if (article?._status !== 'published') {
    return Response.json(
      { error: 'Publish the article before sending it — subscribers would land on a 404.' },
      { status: 400 },
    )
  }

  const subs = await payload.find({
    collection: 'subscribers',
    where: { unsubscribedAt: { equals: null } },
    limit: CEILING + 1,
    depth: 0,
    overrideAccess: true,
    sort: 'createdAt',
  })
  const recipients = (subs.docs as any[]).map((d) => d.email).filter(Boolean)

  if (!recipients.length) {
    return Response.json(
      { error: 'There are no subscribers to send to yet.' },
      { status: 400 },
    )
  }
  if (recipients.length > CEILING) {
    return Response.json(
      {
        error: `${recipients.length} subscribers is past the ${CEILING} this sends in one run. Gmail caps a free account near 500 a day; a list this size needs a dedicated sending service.`,
      },
      { status: 400 },
    )
  }

  const settings: any = await payload.findGlobal({ slug: 'site-settings' })
  const siteName = settings?.siteName || 'SmartMoney Express'
  const url = `${siteUrl()}/insight/${article.slug}`
  const image =
    article?.featuredImage?.sizes?.og?.url ??
    article?.featuredImage?.sizes?.wide?.url ??
    article?.featuredImage?.url ??
    null
  const category = article?.section?.title ?? null

  const results: { email: string; status: 'delivered' | 'failed'; error?: string }[] = []

  for (const email of recipients) {
    if (!(await domainAcceptsMail(email))) {
      results.push({
        email,
        status: 'failed',
        error: 'No mail server for that domain',
      })
      continue
    }

    const mail = buildArticleEmail({
      title: article.title,
      standfirst: article.standfirst,
      category,
      url,
      imageUrl: image,
      siteName,
      unsubscribe: unsubscribeUrl(email),
    })
    try {
      await payload.sendEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        // Lets Gmail and Outlook show their own unsubscribe button, which
        // keeps bulk mail out of the spam folder.
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl(email)}>` },
      } as any)
      results.push({ email, status: 'delivered' })
    } catch (err: any) {
      results.push({ email, status: 'failed', error: reason(err) })
    }
  }

  const delivered = results.filter((r) => r.status === 'delivered').length
  const failed = results.length - delivered
  const sentAt = new Date().toISOString()

  let logId: string | number | null = null
  try {
    const doc = await payload.create({
      collection: 'newsletter-sends',
      data: {
        summary: `${article.title} — accepted for ${delivered} of ${results.length}`,
        article: article.id,
        articleTitle: article.title,
        sentAt,
        sentBy: (user as any).id,
        delivered,
        failed,
        total: results.length,
        recipients: results,
      } as any,
      overrideAccess: true,
    })
    logId = (doc as any).id
  } catch (err) {
    // The mail has already gone. Losing the log is bad but not a reason to
    // report the send as failed, which would invite someone to send it twice.
    console.error('[newsletter] sent, but the log could not be written', err)
  }

  return Response.json({ ok: true, delivered, failed, total: results.length, sentAt, logId, results })
}
