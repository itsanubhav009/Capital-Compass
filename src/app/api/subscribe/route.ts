import { NextResponse } from 'next/server'

/**
 * Beehiiv subscribe endpoint.
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

  const key = process.env.BEEHIIV_API_KEY
  const pub = process.env.BEEHIIV_PUBLICATION_ID
  if (!key || !pub) {
    console.error('[subscribe] BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID is not set')
    return NextResponse.json(
      { error: 'Signup is not connected yet. Try again shortly.' },
      { status: 503 },
    )
  }

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
      const detail = await res.text()
      console.error('[subscribe] beehiiv rejected the request', res.status, detail)
      return NextResponse.json({ error: 'Signup failed. Try again in a moment.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe] network error', err)
    return NextResponse.json({ error: 'Signup failed. Try again in a moment.' }, { status: 502 })
  }
}
