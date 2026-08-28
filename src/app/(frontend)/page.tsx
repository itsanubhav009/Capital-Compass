import Link from 'next/link'
import {
  getFlowTape,
  getInsights,
  getMacroSnapshot,
  getSectorThemes,
  getSettings,
} from '@/lib/queries'
import { FlowTape, ImpactMark, TrendMark } from '@/components/flow'
import { AiSearchSlot, InsightCard, NewsletterForm } from '@/components/site'
import { KIND_LABEL, dayMonth, shortDate } from '@/lib/format'

// Rebuild every 5 minutes; publishing 1–2 posts a day does not need more.
export const revalidate = 300

const img = (m: any) =>
  m?.url ? { url: m.sizes?.card?.url ?? m.url, alt: m.alt ?? '' } : null

export default async function Homepage() {
  const [settings, tape, macro, themes, featured, latest] = await Promise.all([
    getSettings(),
    getFlowTape(6),
    getMacroSnapshot(4),
    getSectorThemes(4),
    getInsights({ featured: true, limit: 3 }),
    getInsights({ limit: 6 }),
  ])
  const s: any = settings
  const lead = featured.docs[0] ?? latest.docs[0]
  const rest = (featured.docs.length > 1 ? featured.docs.slice(1) : latest.docs.slice(1, 4)).slice(0, 3)

  return (
    <>
      {/* ---------------------------------------------------- the thesis --- */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <span className="eyebrow">{s.philosophyEyebrow}</span>
        <h1 className="mt-4 max-w-4xl text-[34px] leading-[1.08] sm:text-[52px]">
          {s.philosophyHeading}
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          {s.philosophyBody}
        </p>

        {s.showAiSearchPlaceholder && (
          <div className="mt-9 max-w-2xl">
            <AiSearchSlot />
          </div>
        )}
      </section>

      {/* --------------------------------- latest institutional activity --- */}
      <FlowTape heading={s.flowTapeHeading} rows={tape} />

      {/* ------------------------------------------------ featured lead --- */}
      {lead && (
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-labelledby="featured">
          <h2 id="featured" className="eyebrow">
            Featured insights
          </h2>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
            <InsightCard
              size="lead"
              href={`/insight/${lead.slug}`}
              kind={KIND_LABEL[lead.collection] ?? 'Analysis'}
              title={lead.title}
              standfirst={lead.standfirst}
              date={shortDate(lead.publishedAt)}
              minutes={lead.readingMinutes}
              image={img(lead.featuredImage)}
              accent={lead.section?.accent}
            />

            <div className="divide-y divide-rule border-t border-rule lg:border-t-0 lg:pt-0">
              {rest.map((d) => (
                <div key={`${d.collection}-${d.id}`} className="py-6 first:lg:pt-0">
                  <InsightCard
                    href={`/insight/${d.slug}`}
                    kind={KIND_LABEL[d.collection] ?? 'Analysis'}
                    title={d.title}
                    standfirst={d.standfirst}
                    date={shortDate(d.publishedAt)}
                    minutes={d.readingMinutes}
                    accent={d.section?.accent}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------- macro snapshot --- */}
      {macro.length > 0 && (
        <section className="border-y border-rule bg-sunken/50" aria-labelledby="macro">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="macro" className="eyebrow">
                Macro snapshot
              </h2>
              <Link
                href="/global-macro"
                className="text-[13px] text-deep underline decoration-brass-soft underline-offset-4"
              >
                All macro notes
              </Link>
            </div>

            <ul className="mt-6 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {macro.map((m: any) => (
                <li key={m.id} className="bg-paper p-5">
                  <Link href={`/insight/${m.slug}`} className="group block h-full">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="tnum text-[11px] uppercase tracking-wider text-ink-faint">
                        {m.region} · {m.assetClass}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-[19px] leading-snug text-ink group-hover:text-deep">
                      {m.title}
                    </h3>
                    {m.impactNote && (
                      <p className="mt-2 text-[14px] leading-snug text-ink-soft">{m.impactNote}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-rule pt-2.5">
                      <ImpactMark impact={m.impact} />
                      <span className="tnum text-[11px] text-ink-faint">
                        {dayMonth(m.publishedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------- sector themes --- */}
      {themes.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-labelledby="themes">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="themes" className="eyebrow">
              Sector themes
            </h2>
            <Link
              href="/sectoral-trends"
              className="text-[13px] text-deep underline decoration-brass-soft underline-offset-4"
            >
              All themes
            </Link>
          </div>

          <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((t: any) => (
              <li key={t.id} className="border-t border-rule pt-4">
                <Link href={`/insight/${t.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="tnum text-[11px] uppercase tracking-wider text-ink-faint">
                      {t.theme?.title ?? t.industry}
                    </span>
                    <TrendMark trend={t.capitalFlowTrend} />
                  </div>
                  <h3 className="mt-2.5 text-[20px] leading-snug text-ink group-hover:text-deep">
                    {t.title}
                  </h3>
                  {t.standfirst && (
                    <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-ink-soft">
                      {t.standfirst}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------- newsletter --- */}
      <section className="mx-auto max-w-6xl px-5 pb-6 sm:px-8">
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
