import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CONTENT_COLLECTIONS } from '@/payload.config'

export type ContentSlug = (typeof CONTENT_COLLECTIONS)[number]

export const client = async () => getPayload({ config })

/**
 * Whether this render is a preview.
 *
 * `draftMode()` throws outside a request scope — during `generateStaticParams`,
 * for instance — so a failure here means "not previewing" rather than an
 * error. Reads then stay on published content, which is the safe default.
 */
export async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/**
 * The `_status` filter, dropped while previewing.
 *
 * Published-only is the whole site's default. In preview we want the newest
 * version of everything, published or not, which is what `draft: true` on the
 * find gives us — but only if we stop filtering the column first.
 */
const statusFilter = (preview: boolean): Record<string, any> =>
  preview ? {} : { _status: { equals: 'published' } }

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
  const preview = await isPreview()
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

  const where: any = { ...statusFilter(preview) }
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
        draft: preview,
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
  const preview = await isPreview()
  for (const collection of CONTENT_COLLECTIONS) {
    const res = await payload.find({
      collection,
      where: { slug: { equals: slug }, ...statusFilter(preview) },
      limit: 1,
      depth: 2,
      draft: preview,
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
  const preview = await isPreview()
  const res = await payload.find({
    collection: 'smart-money-reports',
    where: { ...statusFilter(preview) },
    sort: '-publishedAt',
    limit,
    depth: 1,
    draft: preview,
  })
  return res.docs
}

export async function getMacroSnapshot(limit = 4) {
  const payload = await client()
  const preview = await isPreview()
  const res = await payload.find({
    collection: 'macro-notes',
    where: { ...statusFilter(preview) },
    sort: '-publishedAt',
    limit,
    depth: 1,
    draft: preview,
  })
  return res.docs
}

export async function getSectorThemes(limit = 4) {
  const payload = await client()
  const preview = await isPreview()
  const res = await payload.find({
    collection: 'theme-reports',
    where: { ...statusFilter(preview) },
    sort: '-publishedAt',
    limit,
    depth: 2,
    draft: preview,
  })
  return res.docs
}
// ── APPEND THIS TO src/lib/queries.ts ───────────────────────────────────────

/** Static pages: About, Contact, Disclaimer, Privacy, Terms, Editorial standards. */
export async function getPageBySlug(slug: string) {
  const payload = await client()
  const preview = await isPreview()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug }, ...statusFilter(preview) },
    limit: 1,
    depth: 1,
    draft: preview,
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

/**
 * Sections as browsable tiles: name, how many published pieces sit behind it,
 * and a picture. Sections carry no image of their own, so the tile borrows the
 * newest article's — which is also what keeps it current.
 */
export async function getSectionTiles(): Promise<
  { id: any; title: string; slug: string; count: number; image?: string | null }[]
> {
  const payload = await client()
  const sections: any[] = await getSections()

  const all = (
    await Promise.all(
      CONTENT_COLLECTIONS.map(async (collection) => {
        const res = await payload.find({
          collection,
          where: { _status: { equals: 'published' } },
          sort: '-publishedAt',
          limit: 200,
          depth: 1,
        })
        return res.docs
      }),
    )
  )
    .flat()
    .sort((a: any, b: any) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0))

  return sections.map((s) => {
    const mine = all.filter(
      (d: any) => (typeof d.section === 'object' ? d.section?.slug : null) === s.slug,
    )
    const m: any = mine[0]?.featuredImage
    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      count: mine.length,
      image: m?.sizes?.card?.url ?? m?.url ?? null,
    }
  })
}

/** Most-read first. Ties fall back to newest, so a cold archive still sorts. */
export async function getPopular(limit = 3): Promise<Insight[]> {
  const payload = await client()
  const preview = await isPreview()
  const all = (
    await Promise.all(
      CONTENT_COLLECTIONS.map(async (collection) => {
        const res = await payload.find({
          collection,
          where: { ...statusFilter(preview) },
          sort: '-publishedAt',
          limit: 60,
          depth: 1,
          draft: preview,
        })
        return tag(res.docs, collection)
      }),
    )
  ).flat()

  return all
    .sort(
      (a: any, b: any) =>
        (b.views ?? 0) - (a.views ?? 0) ||
        +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0),
    )
    .slice(0, limit)
}

/**
 * Everything browsable, as tiles: the five sections first, then the themes.
 *
 * Sections alone give five tiles, which is exactly the slider's page size —
 * nothing would ever move. Themes are real archives too (the section page
 * filters on `?theme=`), so folding them in gives the rail something to do
 * and the reader more ways in.
 */
export async function getBrowseTiles(): Promise<
  { id: any; title: string; href: string; count: number; image?: string | null }[]
> {
  const payload = await client()
  const sections: any[] = await getSections()

  const all = (
    await Promise.all(
      CONTENT_COLLECTIONS.map(async (collection) => {
        const res = await payload.find({
          collection,
          where: { _status: { equals: 'published' } },
          sort: '-publishedAt',
          limit: 200,
          depth: 1,
        })
        return res.docs
      }),
    )
  )
    .flat()
    .sort((a: any, b: any) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0))

  const shot = (docs: any[]) => {
    const m: any = docs[0]?.featuredImage
    return m?.sizes?.card?.url ?? m?.url ?? null
  }

  const sectionTiles = sections.map((s) => {
    const mine = all.filter(
      (d: any) => (typeof d.section === 'object' ? d.section?.slug : null) === s.slug,
    )
    return {
      id: `section-${s.id}`,
      title: s.title,
      href: `/${s.slug}`,
      count: mine.length,
      image: shot(mine),
    }
  })

  const themes = await getThemes(20)
  const themeTiles = themes
    .map((t) => {
      const mine = all.filter(
        (d: any) => (typeof d.theme === 'object' ? d.theme?.slug : null) === t.slug,
      )
      return {
        id: `theme-${t.slug}`,
        title: t.title,
        href: `/sectoral-trends?theme=${t.slug}`,
        count: mine.length,
        image: shot(mine),
      }
    })
    .filter((t) => t.count > 0)

  return [...sectionTiles, ...themeTiles]
}

/** Theme names for the tag rail and the footer tag cloud. */
export async function getThemes(limit = 20): Promise<{ title: string; slug: string }[]> {
  const payload = await client()
  try {
    const res = await payload.find({ collection: 'themes', limit, sort: 'title', depth: 0 })
    return res.docs.map((t: any) => ({ title: t.title, slug: t.slug }))
  } catch {
    return []
  }
}
