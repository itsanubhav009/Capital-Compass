import Link from 'next/link'
import {
  getFlowTape,
  getInsights,
  getMacroSnapshot,
  getSectorThemes,
  getSettings,
} from '@/lib/queries'
import { FlowTape, ImpactMark } from '@/components/flow'
import { Band, ListRow, StackCard, SectionHead } from '@/components/cards'
import { HeroCarousel } from '@/components/hero-carousel'
import { NewsletterForm } from '@/components/site'
import { AiSearch } from '@/components/ai-search'
import { KIND_LABEL, cardCategory, dayMonth, shortDate } from '@/lib/format'

export const revalidate = 300

const cat = (d: any) => cardCategory(d.section?.title) || KIND_LABEL[d.collection] || 'Analysis'

// The theme clips hero headlines at eight words; the rails clip at six.
const heroTitle = (t: string) => {
  const parts = t.trim().split(/\s+/)
  return parts.length > 8 ? parts.slice(0, 8).join(' ') : t
}

export default async function Homepage() {
  const [settings, tape, macro, themes, latest] = await Promise.all([
    getSettings(),
    getFlowTape(6),
    getMacroSnapshot(4),
    getSectorThemes(4),
    getInsights({ limit: 20 }),
  ])
  const s: any = settings
  const docs = latest.docs

  // The reference runs three slides in the hero, so the rails start after them.
  const heroSlides = docs.slice(0, 3)
  const hero = heroSlides[0]
  const leftCol = docs.slice(3, 7)
  const rightCol = docs.slice(7, 11)
  const highlight = docs.slice(11, 14)
  const grid = docs.slice(14, 20)

  return (
    <>
      {/* ------------------------------------------------- hero grid --- */}
      {hero && (
        <Band tone="white">
          {/* items-stretch is the default; every column then matches the
              tallest, which is what keeps the three-column block square
              rather than letting the side rails overhang the hero. */}
          <div className="grid gap-[30px] lg:grid-cols-[29fr_42fr_29fr]">
            <div className="order-2 flex h-full flex-col justify-between lg:order-1">
              {leftCol.map((d) => (
                <ListRow
                  key={`${d.collection}-${d.id}`}
                  href={`/insight/${d.slug}`}
                  category={cat(d)}
                  title={d.title}
                  byline={s.siteName}
                  views={d.views ?? 0}
                  media={d.featuredImage}
                />
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <HeroCarousel
                slides={heroSlides.map((d) => ({
                  slug: d.slug,
                  category: cat(d),
                  title: heroTitle(d.title),
                  byline: s.siteName,
                  views: d.views ?? 0,
                  date: shortDate(d.publishedAt),
                  image: d.featuredImage?.sizes?.wide?.url ?? d.featuredImage?.url ?? null,
                }))}
              />
            </div>

            <div className="order-3 flex h-full flex-col justify-between">
              {rightCol.map((d) => (
                <ListRow
                  key={`${d.collection}-${d.id}`}
                  href={`/insight/${d.slug}`}
                  category={cat(d)}
                  title={d.title}
                  byline={s.siteName}
                  views={d.views ?? 0}
                  media={d.featuredImage}
                />
              ))}
            </div>
          </div>
        </Band>
      )}

      {/* --------------------------------- institutional activity --- */}
      <FlowTape heading={s.flowTapeHeading} rows={tape} />

      {/* ------------------------------------------- macro snapshot --- */}
      {macro.length > 0 && (
        <Band tone="tint" labelledBy="macro">
          <SectionHead id="macro" title="Macro snapshot" href="/global-macro" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {macro.map((m: any) => (
              <li key={m.id}>
                <Link
                  href={`/insight/${m.slug}`}
                  className="group flex h-full flex-col border border-rule bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_6px_20px_rgba(16,19,24,0.07)]"
                >
                  <span className="kicker">
                    {m.region} · {m.assetClass}
                  </span>
                  <h3 className="mt-2.5 text-[19px] leading-snug transition-colors group-hover:text-accent">
                    {m.title}
                  </h3>
                  {m.impactNote && (
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                      {m.impactNote}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between border-t border-rule pt-3.5 pt-5">
                    <ImpactMark impact={m.impact} />
                    <span className="tnum text-[12px] text-ink-faint">
                      {dayMonth(m.publishedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      )}

      {/* ----------------------------------------- highlight stories --- */}
      {highlight.length > 0 && (
        <Band tone="dark" labelledBy="highlight">
          <SectionHead id="highlight" title="Highlight stories" dark />
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {highlight.map((d) => (
              <li key={`${d.collection}-${d.id}`}>
                <StackCard
                  dark
                  href={`/insight/${d.slug}`}
                  category={cat(d)}
                  title={d.title}
                  standfirst={d.standfirst}
                  byline={s.siteName}
                  views={d.views ?? 0}
                  date={shortDate(d.publishedAt)}
                  media={d.featuredImage}
                />
              </li>
            ))}
          </ul>
        </Band>
      )}

      {/* -------------------------------------------- ask the archive --- */}
      {s.showAiSearchPlaceholder && (
        <Band tone="white" labelledBy="ask">
          <SectionHead id="ask" title="Ask the archive" />
          <div className="max-w-3xl">
            <AiSearch />
          </div>
        </Band>
      )}

      {/* ------------------------------------------------ latest grid --- */}
      {grid.length > 0 && (
        <Band tone="tint" labelledBy="latest">
          <SectionHead id="latest" title="Latest analysis" />
          <ul className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((d) => (
              <li key={`${d.collection}-${d.id}`}>
                <StackCard
                  href={`/insight/${d.slug}`}
                  category={cat(d)}
                  title={d.title}
                  standfirst={d.standfirst}
                  byline={s.siteName}
                  views={d.views ?? 0}
                  date={shortDate(d.publishedAt)}
                  media={d.featuredImage}
                />
              </li>
            ))}
          </ul>
        </Band>
      )}

      {/* ---------------------------------------------- sector themes --- */}
      {themes.length > 0 && (
        <Band tone="white" labelledBy="themes">
          <SectionHead id="themes" title="Sector themes" href="/sectoral-trends" />
          <ul className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((t: any) => (
              <li key={t.id}>
                <StackCard
                  href={`/insight/${t.slug}`}
                  category={cardCategory(t.theme?.title ?? t.industry) || 'Sectoral Trends'}
                  title={t.title}
                  standfirst={t.standfirst}
                  byline={s.siteName}
                  views={t.views ?? 0}
                  date={shortDate(t.publishedAt)}
                  media={t.featuredImage}
                />
              </li>
            ))}
          </ul>
        </Band>
      )}

      {/* ------------------------------------------------- newsletter --- */}
      <Band tone="tint">
        <NewsletterForm
          heading={s.newsletterHeading}
          body={s.newsletterBody}
          cta={s.newsletterCta}
          finePrint={s.newsletterFinePrint}
          variant="block"
        />
      </Band>
    </>
  )
}
