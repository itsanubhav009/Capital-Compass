import { NextResponse } from 'next/server'
import { client } from '@/lib/queries'

/**
 * Newsletter signup.
 *
 * Saves to the Subscribers collection first, then forwards to Beehiiv if it
 * is configured. It used to go straight to Beehiiv and nowhere else, so with
 * no API key set every signup returned 503 and the address was lost. Storing
 * first means a missing third-party key costs the reader nothing.
 *
 * The API key stays server-side. Switch provider by replacing this one file —
 * nothing in the UI knows which newsletter tool is behind it.
 */

const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW = 60_000
const MAX = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW })
    return false
  }
  entry.count += 1
  return entry.count > MAX
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429 },
    )
  }

  let email = ''
  let source = 'site'
  try {
    const body = await req.json()
    email = String(body.email ?? '').trim().toLowerCase()
    source = String(body.source ?? 'site')
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 })
  }

  // Store first. This is the part that must not fail.
  let saved: { id: string | number } | null = null
  try {
    const payload = await client()
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })
    saved = existing.docs[0]
      ? ((await payload.update({
          collection: 'subscribers',
          id: existing.docs[0].id,
          data: { source },
          overrideAccess: true,
        })) as any)
      : ((await payload.create({
          collection: 'subscribers',
          data: { email, source, forwarded: false },
          overrideAccess: true,
        })) as any)
  } catch (err) {
    console.error('[subscribe] could not store the address', err)
    return NextResponse.json(
      { error: 'Signup failed. Try again in a moment.' },
      { status: 500 },
    )
  }

  const key = process.env.BEEHIIV_API_KEY
  const pub = process.env.BEEHIIV_PUBLICATION_ID

  // No Beehiiv configured: the address is safely stored, so this is a success
  // for the reader. Nothing is gained by showing them an error.
  if (!key || !pub) return NextResponse.json({ ok: true })

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'capital-compass',
        utm_medium: source,
      }),
    })

    if (!res.ok) {
      // Stored but not forwarded. The reader is subscribed as far as we are
      // concerned; the unticked box in the admin is the record to chase.
      console.error('[subscribe] beehiiv rejected the request', res.status, await res.text())
      return NextResponse.json({ ok: true })
    }

    if (saved?.id) {
      const payload = await client()
      await payload.update({
        collection: 'subscribers',
        id: saved.id,
        data: { forwarded: true },
        overrideAccess: true,
      })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe] network error reaching beehiiv', err)
    return NextResponse.json({ ok: true })
  }
}
