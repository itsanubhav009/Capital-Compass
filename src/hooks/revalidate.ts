import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Clear the Next cache for the paths a document appears on.
 *
 * `revalidatePath` needs a request scope, so it is imported lazily and every
 * call is guarded: the seed scripts and migrations run these same hooks
 * outside a request, and a cache miss there must not fail the write. The
 * content is already saved by the time we get here — the worst outcome of a
 * failure is a stale page for `revalidate` seconds, which is where we started.
 */
async function bust(paths: string[]) {
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of new Set(paths)) revalidatePath(p)
  } catch {
    // Outside a request scope. Time-based revalidation still applies.
  }
}

const sectionSlug = (doc: any): string | null =>
  doc && typeof doc.section === 'object' ? (doc.section?.slug ?? null) : null

const pathsFor = (collection: string, doc: any): string[] => {
  const out = ['/', '/sitemap.xml']
  if (!doc?.slug) return out
  out.push(collection === 'pages' ? `/${doc.slug}` : `/insight/${doc.slug}`)
  const section = sectionSlug(doc)
  if (section) out.push(`/${section}`)
  return out
}

/**
 * Autosave means this fires roughly every second while someone types, so the
 * work is skipped unless the change is one a reader could actually see:
 * something published now, or something that was published and no longer is.
 */
export const revalidateAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  collection,
}) => {
  const isLive = doc?._status === 'published'
  const wasLive = previousDoc?._status === 'published'
  if (!isLive && !wasLive) return doc

  await bust([...pathsFor(collection.slug, doc), ...pathsFor(collection.slug, previousDoc)])
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, collection }) => {
  await bust(pathsFor(collection.slug, doc))
  return doc
}

/**
 * Taxonomy and settings changes are not scoped to one page — they move the
 * menu, the footer and the category tiles — so they clear the whole site.
 */
export const revalidateEverything: CollectionAfterChangeHook = async ({ doc }) => {
  await bust(['/', '/sitemap.xml'])
  return doc
}

export const revalidateEverythingOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await bust(['/', '/sitemap.xml'])
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await bust(['/', '/sitemap.xml'])
  return doc
}
