import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getComments, getInsightBySlug, getInsights, getSettings } from '@/lib/queries'
import { ImpactMark, TrendMark } from '@/components/flow'
import { InsightCard } from '@/components/site'
import { Comments } from '@/components/comments'
import { KIND_LABEL, crore, shortDate } from '@/lib/format'

// Rendered per request, cached at the edge. Keeps the build independent
// of database availability.
export const revalidate = 300

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = await getInsightBySlug(slug)
  if (!doc) return {}

  const description =
    doc.meta?.description || doc.standfirst || doc.summary || undefined
  const image = doc.meta?.image?.url ?? doc.featuredImage?.sizes?.og?.url ?? doc.featuredImage?.url

  return {
    title: doc.meta?.title || doc.title,
    description,
    alternates: { canonical: `/insight/${doc.slug}` },
    openGraph: {
      type: 'article',
      title: doc.title,
      description,
      publishedTime: doc.publishedAt ?? undefined,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    },
    twitter: { card: 'summary_large_image', title: doc.title, description },
  }
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [doc, settings] = await Promise.all([getInsightBySlug(slug), getSettings()])
  if (!doc) notFound()
  const s: any = settings

  const [related, comments] = await Promise.all([
    getInsights({
      sectionSlug: doc.section?.slug,
      limit: 3,
      excludeSlug: doc.slug,
    }),
    getComments(doc.slug),
  ])

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    headline: doc.title,
    description: doc.standfirst ?? doc.summary ?? '',
    datePublished: doc.publishedAt,
    dateModified: doc.updatedAt ?? doc.publishedAt,
    mainEntityOfPage: `${SITE}/insight/${doc.slug}`,
    publisher: { '@type': 'Organization', name: s.siteName },
    ...(doc.featuredImage?.url ? { image: [`${SITE}${doc.featuredImage.url}`] } : {}),
  }

  const isReport = doc.collection === 'smart-money-reports'
  const richText = doc.body ?? doc.commentary ?? doc.outlook

  return (
    <article className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* ------------------------------------------------------ masthead --- */}
      <header className="border-b border-rule py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">{KIND_LABEL[doc.collection]}</span>
          {doc.section && (
            <>
              <span aria-hidden className="text-rule-strong">
                /
              </span>
              <Link
                href={`/${doc.section.slug}`}
                className="text-[13px] text-ink-soft hover:text-deep"
              >
                {doc.section.title}
              </Link>
            </>
          )}
        </div>

        <h1 className="mt-4 max-w-4xl text-[32px] leading-[1.1] sm:text-[46px]">{doc.title}</h1>

        {doc.standfirst && (
          <p className="mt-5 max-w-3xl text-[19px] leading-relaxed text-ink-soft">
            {doc.standfirst}
          </p>
        )}

        <div className="tnum mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider text-ink-faint">
          <span>{shortDate(doc.publishedAt)}</span>
          {doc.readingMinutes && <span>{doc.readingMinutes} min read</span>}
          {doc.region && (
            <span>
              {doc.region} · {doc.assetClass}
            </span>
          )}
        </div>
      </header>

      <div className="py-10">
        {/* --------------------------------------------------- the body --- */}
        <div className="min-w-0">
          {doc.featuredImage?.url && (
            <figure className="mb-9">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-sunken">
                <Image
                  src={doc.featuredImage.sizes?.wide?.url ?? doc.featuredImage.url}
                  alt={doc.featuredImage.alt ?? ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                  priority
                />
              </div>
              {doc.featuredImage.credit && (
                <figcaption className="mt-2 text-[12px] text-ink-faint">
                  {doc.featuredImage.credit}
                </figcaption>
              )}
            </figure>
          )}


          {/* Macro impact marker */}
          {doc.impact && (
            <div className="mb-8 flex items-center gap-3 border-y border-rule py-3">
              <span className="eyebrow">Read-across</span>
              <ImpactMark impact={doc.impact} />
              {doc.impactNote && <span className="text-[14px] text-ink-soft">{doc.impactNote}</span>}
            </div>
          )}

          {/* Theme trend marker */}
          {doc.capitalFlowTrend && (
            <div className="mb-8 flex items-center gap-3 border-y border-rule py-3">
              <span className="eyebrow">Capital flow</span>
              <TrendMark trend={doc.capitalFlowTrend} />
            </div>
          )}

          {richText && (
            <div className="prose-cc max-w-[68ch]">
              <RichText data={richText} />
            </div>
          )}

          {/* Companies mentioned — labelled so it can't read as a buy list */}
          {doc.keyStocks?.length > 0 && (
            <section className="mt-12 border-t border-rule pt-6">
              <h2 className="eyebrow">Companies mentioned</h2>
              <p className="mt-1 text-[12px] text-ink-faint">
                Listed because they appear in the analysis above. This is not a buy list.
              </p>
              <ul className="mt-4 divide-y divide-rule">
                {doc.keyStocks.map((k: any, i: number) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                    <span className="text-[15px] text-ink">{k.name}</span>
                    <span className="tnum text-[13px] text-ink-faint">
                      {k.ticker} {k.note ? `· ${k.note}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Charts */}
          {doc.charts?.length > 0 && (
            <section className="mt-12 space-y-8 border-t border-rule pt-8">
              {doc.charts.map((c: any, i: number) => (
                <figure key={i}>
                  {c.image?.url && (
                    <Image
                      src={c.image.sizes?.wide?.url ?? c.image.url}
                      alt={c.image.alt ?? c.caption ?? ''}
                      width={1600}
                      height={900}
                      sizes="(max-width: 1024px) 100vw, 760px"
                      className="h-auto w-full bg-sunken"
                    />
                  )}
                  {(c.caption || c.source) && (
                    <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[12px] text-ink-faint">
                      <span>{c.caption}</span>
                      {c.source && <span className="tnum">Source: {c.source}</span>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </section>
          )}

          {/* Sources */}
          {doc.references?.length > 0 && (
            <section className="mt-12 border-t border-rule pt-6">
              <h2 className="eyebrow">Sources</h2>
              <ol className="mt-3 space-y-1.5">
                {doc.references.map((r: any, i: number) => (
                  <li key={i} className="text-[14px] text-ink-soft">
                    <span className="tnum text-ink-faint">{String(i + 1).padStart(2, '0')} </span>
                    {r.url ? (
                      <a
                        href={r.url}
                        rel="noopener noreferrer nofollow"
                        target="_blank"
                        className="text-deep underline decoration-brass-soft underline-offset-4"
                      >
                        {r.label}
                      </a>
                    ) : (
                      r.label
                    )}
                    {r.publishedOn && (
                      <span className="tnum text-ink-faint"> · {shortDate(r.publishedOn)}</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <p className="mt-12 border-t border-rule pt-6 text-[12px] leading-relaxed text-ink-faint">
            {s.articleDisclaimer}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------ related --- */}
      {related.docs.length > 0 && (
        <section className="border-t border-rule py-12" aria-labelledby="related">
          <h2 id="related" className="eyebrow">
            More from {doc.section?.title ?? 'SmartMoney'}
          </h2>
          <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {related.docs.map((d) => (
              <li key={`${d.collection}-${d.id}`}>
                <InsightCard
                  href={`/insight/${d.slug}`}
                  kind={KIND_LABEL[d.collection] ?? 'Analysis'}
                  title={d.title}
                  standfirst={d.standfirst}
                  date={shortDate(d.publishedAt)}
                  minutes={d.readingMinutes}
                  accent={doc.section?.accent}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------- comments --- */}
      <Comments slug={doc.slug} comments={comments} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </article>
  )
}
