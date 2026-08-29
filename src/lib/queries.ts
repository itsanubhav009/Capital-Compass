import { getPayload } from 'payload'
import config from '@payload-config'
import { CONTENT_COLLECTIONS } from '@/payload.config'

export type ContentSlug = (typeof CONTENT_COLLECTIONS)[number]

export const client = async () => getPayload({ config })

export type Insight = {
  id: string | number
  collection: ContentSlug
  title: string
  slug: string
  standfirst?: string | null
  publishedAt?: string | null
  readingMinutes?: number | null
  featuredImage?: any
  section?: any
  [key: string]: any
}

const tag = (docs: any[], collection: ContentSlug): Insight[] =>
  docs.map((d) => ({ ...d, collection }))

/**
 * The site's core read. Navigation is driven by the `section` taxonomy, so one
 * section page pulls across every content type instead of being tied to a
 * single one. This is what makes "Smart Money Insights" and "Capital Flow –
 * International" work without a bespoke query per menu item.
 */
export async function getInsights(opts: {
  sectionSlug?: string
  themeSlug?: string
  featured?: boolean
  collections?: ContentSlug[]
  limit?: number
  page?: number
  excludeSlug?: string
}): Promise<{ docs: Insight[]; totalDocs: number; totalPages: number }> {
  const payload = await client()
  const collections = opts.collections ?? [...CONTENT_COLLECTIONS]
  const limit = opts.limit ?? 12
  const page = opts.page ?? 1

  let sectionId: string | number | undefined
  if (opts.sectionSlug) {
    const found = await payload.find({
      collection: 'sections',
      where: { slug: { equals: opts.sectionSlug } },
      limit: 1,
      depth: 0,
    })
    if (!found.docs.length) return { docs: [], totalDocs: 0, totalPages: 0 }
    sectionId = found.docs[0].id
  }

  const where: any = { _status: { equals: 'published' } }
  if (sectionId !== undefined) where.section = { equals: sectionId }
  if (opts.featured) where.featured = { equals: true }
  if (opts.excludeSlug) where.slug = { not_equals: opts.excludeSlug }

  // Query each collection, then merge and sort by date. Fine at this scale.
  // If the archive ever passes ~50k docs, swap in a materialised view.
  const results = await Promise.all(
    collections.map(async (collection) => {
      const res = await payload.find({
        collection,
        where,
        limit: limit * page + limit,
        sort: '-publishedAt',
        depth: 1,
      })
      return tag(res.docs, collection)
    }),
  )

  let merged = results
    .flat()
    .sort((a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0))

  // Theme lives on only one collection, so filtering it in the database would
  // mean dropping the other three from the union entirely. Filtering after the
  // merge keeps one code path for both the plain and the filtered archive.
  if (opts.themeSlug) {
    const t = opts.themeSlug
    merged = merged.filter((d: any) => (typeof d.theme === 'object' ? d.theme?.slug : null) === t)
  }

  const start = (page - 1) * limit
  return {
    docs: merged.slice(start, start + limit),
    totalDocs: merged.length,
    totalPages: Math.max(1, Math.ceil(merged.length / limit)),
  }
}

/** Resolve one article by slug across all four content types. */
export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  const payload = await client()
  for (const collection of CONTENT_COLLECTIONS) {
    const res = await payload.find({
      collection,
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
      limit: 1,
      depth: 2,
    })
    if (res.docs.length) return { ...res.docs[0], collection } as Insight
  }
  return null
}

export async function getSections() {
  const payload = await client()
  const res = await payload.find({
    collection: 'sections',
    where: { showInNav: { equals: true } },
    sort: 'navOrder',
    limit: 20,
    depth: 0,
  })
  return res.docs
}

export async function getSectionBySlug(slug: string) {
  const payload = await client()
  const res = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] ?? null
}

export async function getSettings() {
  const payload = await client()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

/** Most recent flow figures, for the homepage tape. */
export async function getFlowTape(limit = 6) {
  const payload = await client()
  const res = await payload.find({
    collection: 'smart-money-reports',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return res.docs
}

export async function getMacroSnapshot(limit = 4) {
  const payload = await client()
  const res = await payload.find({
    collection: 'macro-notes',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return res.docs
}

export async function getSectorThemes(limit = 4) {
  const payload = await client()
  const res = await payload.find({
    collection: 'theme-reports',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return res.docs
}
// ── APPEND THIS TO src/lib/queries.ts ───────────────────────────────────────

/** Static pages: About, Contact, Disclaimer, Privacy, Terms, Editorial standards. */
export async function getPageBySlug(slug: string) {
  const payload = await client()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export async function getPages() {
  const payload = await client()
  const res = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' }, noIndex: { not_equals: true } },
    limit: 100,
    depth: 0,
  })
  return res.docs
}
