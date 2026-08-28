import type { MetadataRoute } from 'next'
import { client, getPages, getSections } from '@/lib/queries'
import { CONTENT_COLLECTIONS } from '@/payload.config'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'daily', priority: 1 },
  ]

  // A transient database failure should not take down the whole build.
  try {
    const payload = await client()
    const [sections, pages] = await Promise.all([getSections(), getPages()])

    const articles = (
      await Promise.all(
        CONTENT_COLLECTIONS.map(async (collection) => {
          const res = await payload.find({
            collection,
            where: { _status: { equals: 'published' } },
            limit: 5000,
            depth: 0,
            sort: '-publishedAt',
          })
          return res.docs
        }),
      )
    ).flat()

    return [
      ...base,
      ...sections.map((s: any) => ({
        url: `${SITE}/${s.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...pages.map((p: any) => ({
        url: `${SITE}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
      ...articles.map((a: any) => ({
        url: `${SITE}/insight/${a.slug}`,
        lastModified: a.updatedAt ?? a.publishedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]
  } catch (err) {
    console.error('[sitemap] database unavailable, emitting homepage only', err)
    return base
  }
}
