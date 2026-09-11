import { NextResponse } from 'next/server'
import { client, getInsightBySlug } from '@/lib/queries'

/**
 * Reader comments.
 *
 * Stored unapproved. Nothing written here reaches the site until someone
 * ticks Approved in the admin panel, which is the only safe default for a
 * publication that names companies.
 *
 * Same shape as /api/contact: in-memory rate limit, honeypot, hard length
 * caps, and a create with overrideAccess so the collection itself stays
 * closed to anonymous writes.
 */

const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW = 10 * 60_000
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
      { error: 'Too many comments. Wait ten minutes and try again.' },
      { status: 429 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  // Honeypot: real people leave this blank. 200 so bots learn nothing.
  if (body.website) return NextResponse.json({ ok: true })

  const name = String(body.name ?? '').trim().slice(0, 120)
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200)
  const comment = String(body.body ?? '').trim().slice(0, 4000)
  const slug = String(body.slug ?? '').trim().slice(0, 250)

  if (!name) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 })
  }
  if (comment.length < 10) {
    return NextResponse.json(
      { error: `Write a little more — ${comment.length} of the 10 characters needed so far.` },
      { status: 400 },
    )
  }
  if (!slug) {
    return NextResponse.json({ error: 'We could not tell which article this is.' }, { status: 400 })
  }

  // Resolve the article rather than trusting the slug in the request body,
  // so a comment can never be filed against something that does not exist.
  const article = await getInsightBySlug(slug)
  if (!article) {
    return NextResponse.json({ error: 'That article no longer exists.' }, { status: 404 })
  }

  try {
    const payload = await client()
    await payload.create({
      collection: 'comments',
      data: {
        name,
        email,
        body: comment,
        articleSlug: article.slug,
        articleTitle: article.title,
        articleCollection: article.collection,
        approved: false,
        meta: { ip, userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? '' },
      },
      overrideAccess: true,
    })

    // Tell the owner there is something to moderate. The comment is already
    // stored, so a mail failure is logged and swallowed.
    try {
      const settings: any = await payload.findGlobal({ slug: 'site-settings' })
      if (settings?.contactEmail) {
        await payload.sendEmail({
          to: settings.contactEmail,
          replyTo: email,
          subject: `New comment awaiting approval: ${article.title}`,
          text: [
            `From: ${name} <${email}>`,
            `On: ${article.title} (/insight/${article.slug})`,
            '',
            comment,
            '',
            '--',
            'Approve or delete it under Inbox → Comments in the admin panel.',
          ].join('\n'),
        })
      }
    } catch (err) {
      console.error('[comments] stored, but notification failed', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[comments] failed to store the comment', err)
    return NextResponse.json({ error: 'That did not post. Try again shortly.' }, { status: 500 })
  }
}
