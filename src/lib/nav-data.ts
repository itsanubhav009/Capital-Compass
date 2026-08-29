import { client, getSections } from '@/lib/queries'
import { CONTENT_COLLECTIONS } from '@/payload.config'

export type Preview = { slug: string; title: string; image?: string | null; date?: string }
export type NavChild = { title: string; slug: string }
export type NavItem = { key: string; title: string; slug?: string; children?: NavChild[] }
export type Tag = { title: string; slug: string }

const img = (m: any) => m?.sizes?.thumb?.url ?? m?.url ?? null
const day = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : undefined

/**
 * Sections whose titles share a prefix before an en dash collapse into one
 * menu item with a dropdown.
 *
 * "Capital Flow – India" and "Capital Flow – International" become a single
 * "Capital Flow" trigger with India and International beneath it, which is
 * how the reference theme groups its own menu. A prefix with only one section
 * behind it stays a plain link — a dropdown of one is just a link wearing a
 * chevron.
 */
export function buildNavTree(sections: any[]): NavItem[] {
  const split = (title: string) => {
    const m = title.split(/\s+[–—-]\s+/)
    return m.length > 1 ? { group: m[0].trim(), leaf: m.slice(1).join(' – ').trim() } : null
  }

  const counts = new Map<string, number>()
  for (const s of sections) {
    const p = split(s.title)
    if (p) counts.set(p.group, (counts.get(p.group) ?? 0) + 1)
  }

  const out: NavItem[] = []
  const placed = new Map<string, NavItem>()

  for (const s of sections) {
    const p = split(s.title)
    if (p && (counts.get(p.group) ?? 0) > 1) {
      let parent = placed.get(p.group)
      if (!parent) {
        parent = { key: p.group, title: p.group, children: [] }
        placed.set(p.group, parent)
        out.push(parent)
      }
      parent.children!.push({ title: p.leaf, slug: s.slug })
    } else {
      out.push({ key: s.slug, title: s.title, slug: s.slug })
    }
  }

  return out
}

/**
 * Four recent articles per section for the nav mega-menu, plus the newest
 * three overall for the footer and the latest headlines for the top bar.
 *
 * One pass over each collection rather than a query per section: with five
 * sections that would be twenty round trips on every page render.
 */
export async function getNavData() {
  const payload = await client()
  const sections = await getSections()

  const all = (
    await Promise.all(
      CONTENT_COLLECTIONS.map(async (collection) => {
        const res = await payload.find({
          collection,
          where: { _status: { equals: 'published' } },
          sort: '-publishedAt',
          limit: 30,
          depth: 1,
        })
        return res.docs
      }),
    )
  )
    .flat()
    .sort((a: any, b: any) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0))

  const previews: Record<string, Preview[]> = {}
  for (const s of sections as any[]) {
    previews[s.slug] = all
      .filter((d: any) => (typeof d.section === 'object' ? d.section?.slug : null) === s.slug)
      .slice(0, 4)
      .map((d: any) => ({
        slug: d.slug,
        title: d.title,
        image: img(d.featuredImage),
        date: day(d.publishedAt),
      }))
  }

  const recent = all.slice(0, 3).map((d: any) => ({
    slug: d.slug,
    title: d.title,
    image: img(d.featuredImage),
    views: d.views ?? 0,
  }))

  // The top bar cycles through headlines rather than pinning the newest one.
  const headlines = all
    .slice(0, 5)
    .map((d: any) => ({ title: d.title as string, slug: d.slug as string }))

  const latest = headlines[0] ?? null

  // Themes ride the right-hand side of the menu bar as a scrolling tag rail.
  let tags: Tag[] = []
  try {
    const res = await payload.find({
      collection: 'themes',
      limit: 20,
      sort: 'title',
      depth: 0,
    })
    tags = res.docs.map((t: any) => ({ title: t.title, slug: t.slug }))
  } catch {
    tags = []
  }

  return { sections, nav: buildNavTree(sections as any[]), previews, recent, latest, headlines, tags }
}
