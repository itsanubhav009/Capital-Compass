import type { NextRequest } from 'next/server'
import { resolveMx } from 'dns/promises'
import { client } from '@/lib/queries'
import { buildArticleEmail, digestFor, unsubscribeUrl } from '@/lib/newsletter'
import { resendEnabled, sendAll, type OutgoingEmail } from '@/lib/resend'
import { seeds } from '@/lib/placement'

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

/**
 * Most addresses one run will take. Gmail's daily ceiling is ~500 on a free
 * account, so 400 there; Resend sends a hundred per request, so the limit is
 * the plan's, not the function's.
 */
const CEILING = () => (resendEnabled() ? 5000 : 400)

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

  if (!process.env.SMTP_HOST && !resendEnabled()) {
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

  // A seed test goes only to the seed inboxes, to see where it lands before
  // the list gets it. They are the owner's own accounts, so no subscriber
  // record is needed.
  const seedTest = body?.seedsOnly === true
  let recipients: string[]
  if (seedTest) {
    recipients = seeds().map((s) => s.email)
    if (!recipients.length) {
      return Response.json(
        { error: 'No seed inboxes are set up. Add SEED_INBOXES to the environment.' },
        { status: 400 },
      )
    }
  } else {
    const subs = await payload.find({
      collection: 'subscribers',
      where: { unsubscribedAt: { equals: null } },
      limit: CEILING() + 1,
      depth: 0,
      overrideAccess: true,
      sort: 'createdAt',
    })
    recipients = (subs.docs as any[]).map((d) => d.email).filter(Boolean)
  }

  if (!recipients.length) {
    return Response.json(
      { error: 'There are no subscribers to send to yet.' },
      { status: 400 },
    )
  }
  if (recipients.length > CEILING()) {
    return Response.json(
      {
        error: resendEnabled()
          ? `${recipients.length} subscribers is past the ${CEILING()} this sends in one run.`
          : `${recipients.length} subscribers is past the ${CEILING()} this sends in one run. Gmail caps a free account near 500 a day; set RESEND_FROM to send through Resend instead.`,
      },
      { status: 400 },
    )
  }

  const digest = await digestFor(payload, article)

  type Row = { email: string; status: 'delivered' | 'failed'; error?: string; resendId?: string; lastEvent?: string }
  const results: Row[] = []
  const provider = resendEnabled() ? 'resend' : 'gmail'

  // Lets Gmail and Outlook show their own unsubscribe button, which keeps
  // bulk mail out of the spam folder. The Post header is RFC 8058: Gmail and
  // Yahoo require bulk senders to offer an unsubscribe the reader can take
  // in one click from the inbox itself, without opening the message.
  const listHeaders = (email: string) => ({
    'List-Unsubscribe': `<${unsubscribeUrl(email)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  })

  const outgoing: OutgoingEmail[] = []
  for (const email of recipients) {
    if (!(await domainAcceptsMail(email))) {
      results.push({ email, status: 'failed', error: 'No mail server for that domain' })
      continue
    }
    const mail = buildArticleEmail({ ...digest, recipient: email, unsubscribe: unsubscribeUrl(email) })
    outgoing.push({ to: email, subject: mail.subject, html: mail.html, text: mail.text, headers: listHeaders(email) })
  }

  if (provider === 'resend') {
    // "sent" until Resend's webhook says how far each copy got.
    for (const r of await sendAll(outgoing)) {
      results.push(
        r.id
          ? { email: r.email, status: 'delivered', resendId: r.id, lastEvent: 'sent' }
          : { email: r.email, status: 'failed', error: r.error },
      )
    }
  } else {
    for (const m of outgoing) {
      try {
        await payload.sendEmail({ ...m } as any)
        results.push({ email: m.to, status: 'delivered' })
      } catch (err: any) {
        results.push({ email: m.to, status: 'failed', error: reason(err) })
      }
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
        summary: `${seedTest ? 'Seed test: ' : ''}${article.title} — accepted for ${delivered} of ${results.length}`,
        article: article.id,
        articleTitle: article.title,
        sentAt,
        provider,
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

  return Response.json({ ok: true, provider, delivered, failed, total: results.length, sentAt, logId, results })
}
