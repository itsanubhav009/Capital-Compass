import { NextResponse } from 'next/server'
import { client } from '@/lib/queries'

const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW = 10 * 60_000
const MAX = 3

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
      { error: 'Too many messages. Wait ten minutes and try again.' },
      { status: 429 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  // Honeypot: real people leave this blank. Return 200 so bots learn nothing.
  if (body.website) return NextResponse.json({ ok: true })

  const name = String(body.name ?? '').trim().slice(0, 120)
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200)
  const subject = String(body.subject ?? '').trim().slice(0, 200)
  const message = String(body.message ?? '').trim().slice(0, 5000)
  const topic = ['general', 'correction', 'media', 'technical'].includes(body.topic)
    ? body.topic
    : 'general'

  if (!name) {
    return NextResponse.json({ error: 'Please add your name.' }, { status: 400 })
  }
  if (!subject) {
    return NextResponse.json({ error: 'Please add a subject.' }, { status: 400 })
  }
  if (message.length < 20) {
    return NextResponse.json(
      {
        error: `Please write a little more — ${message.length} of the 20 characters needed so far.`,
      },
      { status: 400 },
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 })
  }

  try {
    const payload = await client()

    await payload.create({
      collection: 'contact-submissions',
      data: {
        name,
        email,
        topic,
        subject,
        message,
        handled: false,
        meta: { ip, userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? '' },
      },
      overrideAccess: true,
    })

    // Notify the owner. The message is already saved by this point, so a mail
    // failure logs and is swallowed rather than losing the enquiry. Requires
    // contactEmail under Site Settings -> Brand & SEO.
    try {
      const settings: any = await payload.findGlobal({ slug: 'site-settings' })
      if (settings?.contactEmail) {
        await payload.sendEmail({
          to: settings.contactEmail,
          replyTo: email,
          subject: `Contact form: ${subject}`,
          text: [
            `From: ${name} <${email}>`,
            `Topic: ${topic}`,
            '',
            message,
            '',
            '--',
            'Sent from the Capital Compass contact form.',
          ].join('\n'),
        })
      } else {
        console.warn('[contact] no contactEmail in Site Settings — notification skipped')
      }
    } catch (err) {
      console.error('[contact] saved, but notification failed', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] failed to store submission', err)
    return NextResponse.json({ error: 'That did not send. Try again shortly.' }, { status: 500 })
  }
}