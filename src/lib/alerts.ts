import 'server-only'

/**
 * Tells the owner when a newsletter went somewhere other than the inbox.
 *
 * Sent to ALERT_EMAIL, or the contact address in Site Settings. Each alert
 * says what happened and what usually fixes it, because "landed in
 * Promotions" is only useful next to "this is why, and this is what to try".
 */

const ADVICE: Record<string, string[]> = {
  Promotions: [
    'Gmail judged it marketing. Mostly a content signal, not a reputation problem.',
    'Fewer images and links, and a plainer layout, read as a letter rather than an advert.',
    'Open with a sentence written to the reader, not a banner.',
    'Ask readers to reply, or drag it to Primary and choose "Do this for future messages" — each one trains Gmail for that reader.',
  ],
  Updates: [
    'Gmail filed it as a notification. Same remedies as Promotions: more personal text, fewer links.',
  ],
  Social: ['Unusual for a newsletter — check that nothing in it looks like a social-network notification.'],
  Spam: [
    'This one matters. Check, in order:',
    '1. Resend → Domains shows smartmoneyexpress.com as Verified (SPF and DKIM).',
    '2. The _dmarc record exists, and its reports to this address show no failures.',
    '3. No recent spam complaints or bounces (they arrive as alerts like this one).',
    '4. Nothing in the subject or opening that reads as a sales pitch.',
    'Open the copy in that seed inbox and press "Not spam" — it helps that account and is a signal to Gmail.',
  ],
  complained: [
    'A reader pressed "Report spam". They have been taken off the list automatically.',
    'Gmail starts filtering a sender at a complaint rate around 0.3% — a few per thousand.',
    'If these keep coming, make the unsubscribe link more prominent: people report spam when unsubscribing looks harder.',
  ],
  bounced: [
    'The address does not exist or refused the mail. It has been taken off the list automatically.',
    'Many bounces in one send usually means old or mistyped signups. Keep the list clean.',
  ],
}

export async function alertOwner(opts: {
  kind: 'placement' | 'complained' | 'bounced'
  where?: string
  email: string
  subject: string
  detail?: string
}) {
  const to = await alertAddress()
  const from = process.env.RESEND_FROM
  if (!to || !from || !process.env.RESEND_API_KEY) return

  const key = opts.kind === 'placement' ? (opts.where ?? '') : opts.kind
  const headline =
    opts.kind === 'placement'
      ? `Newsletter landed in ${opts.where} for ${opts.email}`
      : opts.kind === 'complained'
        ? `${opts.email} marked the newsletter as spam`
        : `Newsletter bounced for ${opts.email}`

  const text = [
    headline,
    '',
    `Newsletter: ${opts.subject}`,
    opts.detail ? `Detail: ${opts.detail}` : null,
    '',
    'What to do:',
    ...(ADVICE[key] ?? ['Check the send log in the admin panel for the full picture.']).map((l) => `  ${l}`),
    '',
    '— Sent automatically by smartmoneyexpress.com. The full record is in the admin, on the article, under "Previously sent".',
  ]
    .filter((l) => l !== null)
    .join('\n')

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: `⚠ ${headline}`, text }),
    signal: AbortSignal.timeout(15_000),
  }).catch((err) => console.error('[alerts] could not send', err))
}

async function alertAddress(): Promise<string | null> {
  if (process.env.ALERT_EMAIL) return process.env.ALERT_EMAIL
  try {
    const { client } = await import('@/lib/queries')
    const payload = await client()
    const s: any = await payload.findGlobal({ slug: 'site-settings' })
    return s?.contactEmail ?? null
  } catch {
    return null
  }
}
