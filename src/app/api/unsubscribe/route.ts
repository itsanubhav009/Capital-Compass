import type { NextRequest } from 'next/server'
import { client } from '@/lib/queries'
import { verifyUnsubscribeToken } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

/**
 * The unsubscribe link at the foot of every newsletter.
 *
 * Open to the public and deliberately so — demanding a login to stop
 * receiving mail is the kind of thing that gets a sender reported as spam.
 * The token is an HMAC of the address, so a link only ever unsubscribes the
 * person it was sent to, and knowing someone's address is not enough to
 * unsubscribe them.
 *
 * The row is marked rather than deleted. The address stays out of future
 * sends either way, but keeping it preserves the record that they once
 * consented and then withdrew it, which is the part worth being able to
 * show later.
 */

const page = (title: string, body: string, ok = true) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:460px;margin:12vh auto;background:#fff;border-radius:10px;padding:34px 32px;text-align:center;">
<div style="font-size:30px;line-height:1;margin-bottom:14px;">${ok ? '✓' : '!'}</div>
<h1 style="margin:0 0 10px;font-size:20px;color:#121213;">${title}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#5a5a5d;">${body}</p>
</div></body></html>`,
    { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') ?? '').trim().toLowerCase()
  const token = req.nextUrl.searchParams.get('token') ?? ''

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page(
      'That link is not valid',
      'It may have been altered in transit, or truncated by an email client. Reply to any newsletter and we will take you off the list by hand.',
      false,
    )
  }

  try {
    const payload = await client()
    const found = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs.length) {
      await payload.update({
        collection: 'subscribers',
        id: (found.docs[0] as any).id,
        data: { unsubscribedAt: new Date().toISOString() } as any,
        overrideAccess: true,
      })
    }
    // Reports success even for an address that was never on the list: whether
    // a given address is subscribed is not something a stranger should be
    // able to probe, and the outcome the reader wanted is true either way.
    return page(
      'You have been unsubscribed',
      `${email} will not receive any more newsletters. You can subscribe again at any time from the site.`,
    )
  } catch (err) {
    console.error('[unsubscribe] failed', err)
    return page(
      'Something went wrong',
      'We could not update the list just now. Try the link again shortly, or reply to any newsletter and we will do it by hand.',
      false,
    )
  }
}
