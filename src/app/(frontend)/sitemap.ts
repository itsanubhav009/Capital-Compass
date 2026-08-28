import type { MetadataRoute } from 'next'
import { getSections, client } from '@/lib/queries'
import { CONTENT_COLLECTIONS } from '@/payload.config'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await client()
  const sections = await getSections()

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
    { url: SITE, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`, changeFrequency: 'yearly', priority: 0.3 },
    ...sections.map((s: any) => ({
      url: `${SITE}/${s.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...articles.map((a: any) => ({
      url: `${SITE}/insight/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
