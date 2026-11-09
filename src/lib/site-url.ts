/**
 * The site's public address, for anything that leaves the page: canonical
 * tags, the sitemap, structured data, and every link in a newsletter.
 *
 * NEXT_PUBLIC_SITE_URL is the setting, but on production it still named the
 * project's vercel.app alias after the site moved to its own domain, so the
 * sitemap told Google to index the alias and every newsletter link went
 * there. In production a vercel.app value is therefore treated as stale and
 * the real domain is used instead. Preview deployments keep their own
 * address, so a link in a preview stays in that preview.
 *
 * Five files read the variable directly before this; they all come here now,
 * so the next move is one line.
 */
export const CANONICAL_URL = 'https://www.smartmoneyexpress.com'

export function siteUrl(): string {
  const set = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/$/, '')
  let host = ''
  try {
    host = set ? new URL(set).host : ''
  } catch {
    host = ''
  }

  if (process.env.VERCEL_ENV === 'production' && (!host || host.endsWith('.vercel.app'))) {
    return CANONICAL_URL
  }
  if (host) return set
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/** An absolute URL for a path or an already-absolute URL (media on R2). */
export const absolute = (pathOrUrl: string): string =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
