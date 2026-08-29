import Link from 'next/link'
import {
  getFlowTape,
  getInsights,
  getMacroSnapshot,
  getSectorThemes,
  getSettings,
} from '@/lib/queries'
import { FlowTape, ImpactMark, TrendMark } from '@/components/flow'
import { HeroCard, ListRow, StackCard, SectionHead } from '@/components/cards'
import { NewsletterForm } from '@/components/site'
import { AiSearch } from '@/components/ai-search'
import { KIND_LABEL, dayMonth, shortDate } from '@/lib/format'

export const revalidate = 300

const cat = (d: any) => d.section?.title ?? KIND_LABEL[d.collection] ?? 'Analysis'

export default async function Homepage() {
  const [settings, tape, macro, themes, latest] = await Promise.all([
    getSettings(),
    getFlowTape(6),
    getMacroSnapshot(4),
    getSectorThemes(4),
    getInsights({ limit: 16 }),
  ])
  const s: any = settings
  const docs = latest.docs

  const hero = docs[0]
  const leftCol = docs.slice(1, 5)
  const rightCol = docs.slice(5, 9)
  const grid = docs.slice(9, 15)

  return (
    <>
      {/* ------------------------------------------------ hero grid --- */}
      {hero && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6" aria-label="Latest">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-7">
            <div className="order-2 divide-y divide-rule lg:order-1">
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
              <HeroCard
                href={`/insight/${hero.slug}`}
                category={cat(hero)}
                title={hero.title}
                byline={s.siteName}
                views={hero.views ?? 0}
                date={shortDate(hero.publishedAt)}
                media={hero.featuredImage}
              />
            </div>

            <div className="order-3 divide-y divide-rule">
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
        </section>
      )}

      {/* ------------------------------------ institutional activity --- */}
      <FlowTape heading={s.flowTapeHeading} rows={tape} />

      {/* ------------------------------------------------ AI search --- */}
      {s.showAiSearchPlaceholder && (
        <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
          <SectionHead title="Ask the archive" />
          <div className="max-w-3xl">
            <AiSearch />
          </div>
        </section>
      )}

      {/* -------------------------------------------- macro snapshot --- */}
      {macro.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6" aria-labelledby="macro">
          <SectionHead title="Macro snapshot" href="/global-macro" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {macro.map((m: any) => (
              <li key={m.id} className="border border-rule p-5 transition-colors hover:border-ink">
                <Link href={`/insight/${m.slug}`} className="group block">
                  <span className="kicker">
                    {m.region} · {m.assetClass}
                  </span>
                  <h3 className="mt-2 text-[19px] leading-snug transition-colors group-hover:text-accent">
                    {m.title}
                  </h3>
                  {m.impactNote && (
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{m.impactNote}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-rule pt-3">
                    <ImpactMark impact={m.impact} />
                    <span className="tnum text-[12px] text-ink-faint">{dayMonth(m.publishedAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --------------------------------------------- latest grid --- */}
      {grid.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
          <SectionHead title="Latest analysis" />
          <ul className="grid gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      )}

      {/* -------------------------------------------- sector themes --- */}
      {themes.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
          <SectionHead title="Sector themes" href="/sectoral-trends" />
          <ul className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((t: any) => (
              <li key={t.id} className="border-t-2 border-ink pt-4">
                <Link href={`/insight/${t.slug}`} className="group block">
                  <div className="flex items-center justify-between gap-2">
                    <span className="kicker">{t.theme?.title ?? t.industry}</span>
                    <TrendMark trend={t.capitalFlowTrend} />
                  </div>
                  <h3 className="mt-2.5 text-[19px] leading-snug transition-colors group-hover:text-accent">
                    {t.title}
                  </h3>
                  {t.standfirst && (
                    <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink-soft">
                      {t.standfirst}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------------------------------------- newsletter --- */}
      <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-4 sm:px-6">
        <NewsletterForm
          heading={s.newsletterHeading}
          body={s.newsletterBody}
          cta={s.newsletterCta}
          finePrint={s.newsletterFinePrint}
          variant="block"
        />
      </section>
    </>
  )
}
