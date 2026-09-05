import type { CollectionAdminOptions } from 'payload'

/** Where a document of this collection lives on the public site. */
export const publicPath = (collection: string, slug?: string | null) =>
  collection === 'pages' ? `/${slug ?? ''}` : `/insight/${slug ?? ''}`

/**
 * The admin's two preview affordances, built once and shared.
 *
 * `preview` is the button that opens the draft in a new tab: it goes through
 * /api/preview, which checks the secret and the signed-in user before turning
 * on Next's draft mode.
 *
 * `livePreview` is the in-panel iframe. It points at the same route for the
 * same reason — without draft mode the iframe would show the last published
 * version and quietly contradict the editor's screen.
 */
export const previewOptions = (
  collection: string,
): Pick<CollectionAdminOptions, 'preview' | 'livePreview'> => {
  /**
   * Relative on purpose.
   *
   * Built from NEXT_PUBLIC_SITE_URL this pointed at whichever hostname that
   * variable named, which is not necessarily the one the admin is open on. A
   * Vercel project answers on several. When they differ, the Live Preview
   * iframe is cross-origin, the site's `X-Frame-Options: SAMEORIGIN` blocks
   * it, and the panel reads "refused to connect".
   *
   * A relative URL resolves against the admin's own origin, so preview always
   * follows the reader to whatever host they signed in on.
   */
  const url = (data: any) => {
    if (!data?.slug) return '/'
    const q = new URLSearchParams({
      secret: process.env.PREVIEW_SECRET ?? '',
      collection,
      slug: String(data.slug),
    })
    return `/api/preview?${q.toString()}`
  }

  return {
    preview: (data) => url(data),
    livePreview: {
      url: ({ data }) => url(data),
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { name: 'laptop', label: 'Laptop', width: 1366, height: 800 },
        { name: 'desktop', label: 'Desktop', width: 1580, height: 900 },
      ],
    },
  }
}
