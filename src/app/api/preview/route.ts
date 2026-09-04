import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { client } from '@/lib/queries'
import { CONTENT_COLLECTIONS } from '@/payload.config'

export const dynamic = 'force-dynamic'

const ALLOWED = [...CONTENT_COLLECTIONS, 'pages'] as string[]

/**
 * Opens a draft in the live site.
 *
 * Payload's Preview button lands here with the collection, the slug and a
 * secret. Two things are checked before draft mode is switched on:
 *
 *  1. The secret matches `PREVIEW_SECRET`. Without it anyone could read
 *     unpublished copy by guessing a slug.
 *  2. The caller is a logged-in Payload user. The secret travels in a URL and
 *     URLs leak — into histories, referrers, chat logs — so it is not enough
 *     on its own.
 *
 * The redirect target is rebuilt here from the collection and slug rather than
 * taken from the query string, so a crafted link cannot turn this route into
 * an open redirect.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const collection = searchParams.get('collection')
  const slug = searchParams.get('slug')

  const expected = process.env.PREVIEW_SECRET
  if (!expected) {
    return new Response('Preview is not configured: PREVIEW_SECRET is unset.', { status: 501 })
  }
  if (secret !== expected) {
    return new Response('Invalid preview secret.', { status: 401 })
  }
  if (!collection || !ALLOWED.includes(collection)) {
    return new Response('Unknown collection.', { status: 400 })
  }
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return new Response('Missing or malformed slug.', { status: 400 })
  }

  const payload = await client()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Sign in to the admin panel before previewing.', { status: 403 })
  }

  ;(await draftMode()).enable()

  redirect(collection === 'pages' ? `/${slug}` : `/insight/${slug}`)
}
