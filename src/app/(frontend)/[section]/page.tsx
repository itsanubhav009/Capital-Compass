import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInsights, getSectionBySlug, getSections } from '@/lib/queries'
import { InsightCard } from '@/components/site'
import { KIND_LABEL, shortDate } from '@/lib/format'

export const revalidate = 300

/**
 * One route covers every menu item. Sections are content, not code, so the
 * client can add "Capital Flow – Gulf" next year without a developer.
 */
export async function generateStaticParams() {
  const sections = await getSections()
  return sections.map((s: any) => ({ section: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const doc: any = await getSectionBySlug(section)
  if (!doc) return {}
  return {
    title: doc.title,
    description: doc.blurb ?? undefined,
    alternates: { canonical: `/${doc.slug}` },
    openGraph: { title: doc.title, description: doc.blurb ?? undefined, type: 'website' },
  }
}

const img = (m: any) => (m?.url ? { url: m.sizes?.card?.url ?? m.url, alt: m.alt ?? '' } : null)

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { section } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const doc: any = await getSectionBySlug(section)
  if (!doc) notFound()

  const { docs, totalPages } = await getInsights({ sectionSlug: section, limit: 12, page })

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="border-b border-rule py-12 sm:py-16">
        <span className="eyebrow">Section</span>
        <h1 className="mt-3 text-[36px] sm:text-[46px]">{doc.title}</h1>
        {doc.blurb && (
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{doc.blurb}</p>
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
                accent={doc.accent}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between border-t border-rule py-8" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={`/${section}?page=${page - 1}`}
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
              href={`/${section}?page=${page + 1}`}
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
