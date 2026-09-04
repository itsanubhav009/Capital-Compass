import type { CollectionAdminOptions } from 'payload'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
  const url = (data: any) => {
    if (!data?.slug) return SITE
    const q = new URLSearchParams({
      secret: process.env.PREVIEW_SECRET ?? '',
      collection,
      slug: String(data.slug),
    })
    return `${SITE}/api/preview?${q.toString()}`
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
