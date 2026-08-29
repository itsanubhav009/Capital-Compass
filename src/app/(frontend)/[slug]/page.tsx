import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  client,
  getInsights,
  getPageBySlug,
  getSectionBySlug,
  getSections,
} from '@/lib/queries'
import { InsightCard } from '@/components/site'
import { KIND_LABEL, shortDate } from '@/lib/format'

// Rendered per request, cached at the edge. Keeps the build independent
// of database availability.
// This route reads searchParams for pagination, which is inherently
// dynamic. Pairing that with `revalidate` throws DYNAMIC_SERVER_USAGE,
// so the route opts out of static caching entirely.
export const dynamic = 'force-dynamic'

/**
 * One route serves both section archives and static pages.
 *
 * Sections are checked first, so a page slug can never shadow a menu item.
 * That means /about, /privacy and /capital-flow-india all live here, and
 * adding a new page in the admin panel needs no code change.
 */
export async function generateStaticParams() {
  // Render on demand instead of at build time. Pages still cache for five
  // minutes via `revalidate`, and the build no longer depends on the database.
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const section: any = await getSectionBySlug(slug)
  if (section) {
    return {
      title: section.title,
      description: section.blurb ?? undefined,
      alternates: { canonical: `/${section.slug}` },
      openGraph: { title: section.title, description: section.blurb ?? undefined, type: 'website' },
    }
  }

  const page: any = await getPageBySlug(slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.standfirst ?? undefined,
    alternates: { canonical: `/${page.slug}` },
    robots: page.noIndex ? { index: false, follow: true } : undefined,
    openGraph: { title: page.title, description: page.standfirst ?? undefined, type: 'article' },
  }
}

const img = (m: any) => (m?.url ? { url: m.sizes?.card?.url ?? m.url, alt: m.alt ?? '' } : null)

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; theme?: string }>
}) {
  const { slug } = await params

  const section: any = await getSectionBySlug(slug)
  if (section) return <SectionArchive section={section} searchParams={searchParams} />

  const page: any = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="border-b border-rule py-12 sm:py-16">
        <h1 className="max-w-3xl text-[36px] sm:text-[46px]">{page.title}</h1>
        {page.standfirst && (
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            {page.standfirst}
          </p>
        )}
      </header>

      <div className="prose-cc max-w-[68ch] py-12">
        <RichText data={page.body} />
      </div>

      {page.lastReviewed && (
        <p className="tnum border-t border-rule pb-12 pt-6 text-[11px] uppercase tracking-wider text-ink-faint">
          Last reviewed {shortDate(page.lastReviewed)}
        </p>
      )}
    </article>
  )
}

/* ------------------------------------------------------- section archive --- */

async function SectionArchive({
  section,
  searchParams,
}: {
  section: any
  searchParams: Promise<{ page?: string; theme?: string }>
}) {
  const { page: pageParam, theme } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { docs, totalPages } = await getInsights({
    sectionSlug: section.slug,
    themeSlug: theme,
    limit: 12,
    page,
  })
  const qs = theme ? `&theme=${encodeURIComponent(theme)}` : ''

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="border-b border-rule py-12 sm:py-16">
        <span className="eyebrow">Section</span>
        <h1 className="mt-3 text-[36px] sm:text-[46px]">{section.title}</h1>
        {section.blurb && (
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            {section.blurb}
          </p>
        )}
        {theme && (
          <p className="mt-5 flex items-center gap-3 text-[14px] text-ink-soft">
            Filtered by theme
            <Link
              href={`/${section.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-sunken px-3 py-1 text-[13px] font-medium text-ink hover:text-accent"
            >
              {theme.replace(/-/g, ' ')}
              <span aria-hidden>×</span>
            </Link>
          </p>
        )}
      </header>

      {docs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-[22px] text-ink">Nothing published here yet.</p>
          <p className="mt-2 text-[15px] text-ink-soft">
            New reports land most weekdays.{' '}
            <Link href="/#newsletter" className="text-deep underline underline-offset-4">
              Get them by email
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="grid gap-x-10 gap-y-12 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <li key={`${d.collection}-${d.id}`}>
              <InsightCard
                href={`/insight/${d.slug}`}
                kind={KIND_LABEL[d.collection] ?? 'Analysis'}
                title={d.title}
                standfirst={d.standfirst}
                date={shortDate(d.publishedAt)}
                minutes={d.readingMinutes}
                image={img(d.featuredImage)}
                accent={section.accent}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-rule py-8"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link
              href={`/${section.slug}?page=${page - 1}${qs}`}
              className="text-[14px] text-deep underline underline-offset-4"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="tnum text-[12px] uppercase tracking-wider text-ink-faint">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/${section.slug}?page=${page + 1}${qs}`}
              className="text-[14px] text-deep underline underline-offset-4"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
