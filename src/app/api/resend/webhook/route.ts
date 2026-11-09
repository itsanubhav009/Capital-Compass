import { after } from 'next/server'
import { client } from '@/lib/queries'
import { vectorPool } from '@/lib/embeddings'
import { verifyWebhook } from '@/lib/resend'
import { placementFor, seeds } from '@/lib/placement'
import { alertOwner } from '@/lib/alerts'

export const dynamic = 'force-dynamic'
// The placement check below waits for Gmail to file the copy, then signs in.
export const maxDuration = 60

/** Where a copy belongs. Anything else is worth an alert. */
const INBOX = new Set(['Primary', 'Inbox (tabs off)'])

/**
 * Where Resend reports what happened to each newsletter copy.
 *
 * Configure in Resend → Webhooks with this URL and the events below, and put
 * the signing secret in RESEND_WEBHOOK_SECRET. Unsigned or mis-signed
 * requests are refused: this route can take people off the list.
 *
 * Each event updates the one recipient row it names, by Resend's id, with a
 * single UPDATE. Resend fires the deliveries for a whole send within seconds
 * of each other, and reading the log, changing one row and writing it all
 * back would have each of those overwrite the others.
 *
 * A row never moves backwards: a late "delivered" does not undo "opened".
 * Bounced and complained outrank everything, as the things worth knowing.
 *
 * When a copy is delivered to a seed inbox, the tab it landed in is checked
 * automatically and the owner is emailed if it is not the inbox. Complaints
 * and permanent bounces are emailed too. That work runs after the response,
 * so Resend gets its answer at once and does not retry a slow request — and
 * each alert is guarded so a retried event cannot send it twice.
 */

const RANK: Record<string, number> = {
  sent: 0,
  delivery_delayed: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  bounced: 9,
  complained: 10,
}

export async function POST(req: Request) {
  const body = await req.text()
  if (!verifyWebhook(body, req.headers)) {
    return Response.json({ error: 'Signature did not verify.' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Malformed body.' }, { status: 400 })
  }

  const kind = String(event?.type ?? '').replace(/^email\./, '')
  const id = event?.data?.email_id
  const to: string | undefined = Array.isArray(event?.data?.to) ? event.data.to[0] : event?.data?.to
  if (!id || !(kind in RANK)) return Response.json({ ok: true, ignored: kind || 'unknown' })

  const at = event?.created_at ? new Date(event.created_at) : new Date()
  const db = vectorPool()

  // Ranks are spelled out in SQL so the comparison happens inside the
  // UPDATE, not between a read and a write.
  const rankSql = `CASE COALESCE(last_event, 'sent') ${Object.entries(RANK)
    .map(([k, v]) => `WHEN '${k}' THEN ${v}`)
    .join(' ')} ELSE 0 END`

  await db.query(
    `UPDATE newsletter_sends_recipients
        SET last_event = CASE WHEN ${rankSql} <= $2 THEN $3 ELSE last_event END,
            opened_at  = CASE WHEN $3 = 'opened'  AND opened_at  IS NULL THEN $4 ELSE opened_at END,
            clicked_at = CASE WHEN $3 = 'clicked' AND clicked_at IS NULL THEN $4 ELSE clicked_at END,
            status     = CASE WHEN $3 = 'bounced' THEN 'failed' ELSE status END,
            error      = CASE WHEN $3 = 'bounced' THEN $5 WHEN $3 = 'complained' THEN 'Marked as spam by the reader' ELSE error END
      WHERE resend_id = $1`,
    [id, RANK[kind], kind, at, bounceReason(event)],
  )

  // A permanent bounce or a spam complaint takes the address off the list.
  // Mailing a dead address or someone who called it spam is the fastest way
  // to have everyone else's copy filtered.
  const permanent = kind === 'bounced' && !/transient|temporary|soft/i.test(event?.data?.bounce?.type ?? '')
  if (to && (permanent || kind === 'complained')) {
    const payload = await client()
    const found = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: to.toLowerCase() } },
      limit: 1,
      overrideAccess: true,
    })
    const sub: any = found.docs[0]
    if (sub && !sub.unsubscribedAt) {
      // Only the first report of it alerts; a retry finds them already off.
      after(() =>
        alertOwner({
          kind: kind === 'complained' ? 'complained' : 'bounced',
          email: to,
          subject: String(event?.data?.subject ?? ''),
          detail: kind === 'bounced' ? bounceReason(event) : undefined,
        }),
      )
      await payload.update({
        collection: 'subscribers',
        id: sub.id,
        data: {
          unsubscribedAt: at.toISOString(),
          suppressedReason:
            kind === 'complained'
              ? 'Marked a newsletter as spam'
              : `Address bounced: ${bounceReason(event)}`.slice(0, 200),
        } as any,
        overrideAccess: true,
      })
    }
  }

  const seed = kind === 'delivered' && to ? seeds().find((s) => s.email === to.toLowerCase()) : undefined
  if (seed) {
    after(async () => {
      // Gmail files a message as it accepts it; a short wait covers the gap
      // between Resend hearing "accepted" and the copy being searchable.
      await new Promise((r) => setTimeout(r, 20_000))
      const where = await placementFor(seed, String(event?.data?.subject ?? ''), at)
      if (where === 'Not arrived yet' || where.startsWith('Could not')) return
      // Recorded once: a retried "delivered" finds the row already filled.
      const res = await db.query(
        `UPDATE newsletter_sends_recipients SET placement = $1 WHERE resend_id = $2 AND placement IS NULL`,
        [where, id],
      )
      if (res.rowCount && !INBOX.has(where)) {
        await alertOwner({ kind: 'placement', where, email: seed.email, subject: String(event?.data?.subject ?? '') })
      }
    })
  }

  return Response.json({ ok: true })
}

function bounceReason(event: any): string {
  const b = event?.data?.bounce
  return String(b?.message ?? b?.subType ?? b?.type ?? 'The receiving server refused it').slice(0, 180)
}
