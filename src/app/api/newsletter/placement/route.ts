import type { NextRequest } from 'next/server'
import { client } from '@/lib/queries'
import { vectorPool } from '@/lib/embeddings'
import { placementFor, seeds } from '@/lib/placement'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Checks where one send landed in each seed inbox and records it on the log.
 *
 * Run a minute or two after sending: Gmail sorts on arrival, and a copy that
 * is still in transit reads as "Not arrived yet". Safe to run again.
 *
 * Requires a logged-in user — it signs into mailboxes.
 */
export async function POST(req: NextRequest) {
  const payload = await client()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return Response.json({ error: 'Sign in to the admin panel first.' }, { status: 403 })

  const list = seeds()
  if (!list.length) {
    return Response.json(
      { error: 'No seed inboxes are set up. Add SEED_INBOXES to the environment — see lib/placement.ts.' },
      { status: 400 },
    )
  }

  const { sendId } = await req.json().catch(() => ({}) as any)
  if (!sendId) return Response.json({ error: 'No send given.' }, { status: 400 })

  let send: any
  try {
    send = await payload.findByID({ collection: 'newsletter-sends', id: sendId, depth: 0, overrideAccess: true })
  } catch {
    return Response.json({ error: 'That send no longer exists.' }, { status: 404 })
  }

  const sentTo = new Set(((send.recipients ?? []) as any[]).map((r) => String(r.email).toLowerCase()))
  const targets = list.filter((s) => sentTo.has(s.email))
  if (!targets.length) {
    return Response.json(
      {
        // Addresses only, never the passwords: enough to spot a typo.
        error: `None of the seed inboxes were on this send. Seeds configured: ${list
          .map((s) => s.email)
          .join(', ')}. Each must be subscribed, spelled exactly as on the list.`,
      },
      { status: 400 },
    )
  }

  const subject = send.articleTitle ?? ''
  const since = new Date(send.sentAt ?? send.createdAt)
  const results = await Promise.all(
    targets.map(async (s) => ({ email: s.email, placement: await placementFor(s, subject, since) })),
  )

  const db = vectorPool()
  for (const r of results) {
    await db.query(
      `UPDATE newsletter_sends_recipients SET placement = $1 WHERE _parent_id = $2 AND lower(email) = $3`,
      [r.placement, send.id, r.email],
    )
  }

  return Response.json({ ok: true, results })
}
