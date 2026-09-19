import Link from 'next/link'
import {
  // See the commented block further down before deleting this import.
  getInsights,
  getRecentToppedUp,
  getSectionTiles,
  // getSectionTiles — fed the "Explore Categories" panel in the right-hand
  // rail. That position now carries the ad banner, so the query is off too.
  getSectoralTrends,
  getSettings,
} from '@/lib/queries'
import { Band, ListRow, StackCard } from '@/components/cards'
import {
  BigGroup,
  // CategoryTiles,
  Head,
  LatestStories,
  Panel,
  RoundStrip,
  SubscribeBanner,
  // WideRow,
} from '@/components/sections'
// import { HighlightSlider } from '@/components/highlight-slider'
import { CategorySlider } from '@/components/category-slider'
import { CardCarousel } from '@/components/card-carousel'
import { Reveal } from '@/components/reveal'
import { HeroCarousel } from '@/components/hero-carousel'
import { NewsletterForm } from '@/components/site'
import { AiSearch } from '@/components/ai-search'
import { AdSlot } from '@/components/ad-slot'
import { KIND_LABEL, cardCategory, dayMonth, shortDate } from '@/lib/format'

export const revalidate = 300

const cat = (d: any) => cardCategory(d.section?.title) || KIND_LABEL[d.collection] || 'Analysis'

// The theme clips hero headlines at eight words; the rails clip at six.
const heroTitle = (t: string) => {
  const parts = t.trim().split(/\s+/)
  return parts.length > 8 ? parts.slice(0, 8).join(' ') : t
}

export default async function Homepage() {
  const [settings, themes, latest, india, intl, insights, macro, recent, tiles] =
    await Promise.all([
      getSettings(),
      getSectoralTrends(12),
      getInsights({ limit: 24, placement: 'hero' }),
      // The hero rails are section-specific now: India on the left,
      // International on the right, so the split is legible rather than
      // whatever happened to be newest.
      getInsights({ sectionSlug: 'capital-flow-india', limit: 4, placement: 'rails' }),
      getInsights({ sectionSlug: 'capital-flow-international', limit: 4, placement: 'rails' }),
      getInsights({ sectionSlug: 'smart-money-insights', limit: 4, placement: 'sectionBand' }),
      getInsights({ sectionSlug: 'global-macro', limit: 7, placement: 'sectionBand' }),
      getRecentToppedUp(7, 14),
      getSectionTiles(),
    ])
  const s: any = settings
  const docs = latest.docs
  const byline = s.siteName

  // Middle of the hero: the three most recently published pieces from any
  // section, which is what the carousel is for.
  const heroSlides = docs.slice(0, 3)
  const hero = heroSlides[0]

  // A section can be thin. Rather than leave a rail short, top it up from the
  // general list — the alternative is a column with two cards and a hole.
  const fill = (rows: any[], n: number, used: Set<string>) => {
    const key = (d: any) => `${d.collection}-${d.id}`
    const out = rows.filter((d) => !used.has(key(d))).slice(0, n)
    out.forEach((d) => used.add(key(d)))
    if (out.length < n) {
      for (const d of docs) {
        if (out.length >= n) break
        if (used.has(key(d))) continue
        used.add(key(d))
        out.push(d)
      }
    }
    return out
  }

  const spoken = new Set<string>(heroSlides.map((d: any) => `${d.collection}-${d.id}`))
  const leftCol = fill(india.docs, 4, spoken)
  const rightCol = fill(intl.docs, 4, spoken)

  // Latest Stories, over the photograph: the last fortnight first, topped up
  // so the block is never half-built. See getRecentToppedUp.
  const recentDocs = recent.docs
  const recentLead = recentDocs[0]
  const recentRest = recentDocs.slice(1, 7)

  // Insights fills the dark band; Global Macro the block further down. Both
  // read from their own section so the heading means what it says, and both
  // reorder themselves as new pieces are published.
  const insightDocs = insights.docs.length ? insights.docs : docs.slice(0, 4)
  const insightLead = insightDocs[0]
  const insightRest = insightDocs.slice(1, 4)

  const macroDocs = macro.docs.length ? macro.docs : docs.slice(0, 7)
  const macroLead = macroDocs[0]
  const macroRail = macroDocs.slice(1, 4)
  const macroRow = macroDocs.slice(4, 7)

  // The strip and the subscribe banner each sit over a photograph. They take
  // pictures from the far end of the archive so nothing on screen repeats.
  const pic = (d: any) =>
    (d?.featuredImage as any)?.sizes?.wide?.url ?? (d?.featuredImage as any)?.url ?? null
  const backdrop = pic(docs[docs.length - 1]) ?? pic(hero)
  const bannerPic = pic(docs[docs.length - 2]) ?? pic(hero)

  const withMeta = (d: any) => ({ ...d, category: cat(d), byline })

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
                  media={d.featuredImage}
                />
              ))}
            </div>
          </div>
        </Band>
      )}

      {/* ------------------------------------- explore categories --- */}
      {tiles.length > 0 && (
        <Band tone="white" labelledBy="explore">
          {/* No "View All": the tiles are the full set of sections, so the
              link had nowhere to go that this row does not already offer. */}
          <Head id="explore" title="Explore Categories" />
          <Reveal>
            <CategorySlider
              tiles={tiles.map((t) => ({ ...t, href: `/${t.slug}` }))}
            />
          </Reveal>
        </Band>
      )}

      {/* ----------------------------------------- latest stories --- */}
      <RoundStrip
        backdrop={backdrop}
        heading="Latest Stories"
        lead={recentLead ? withMeta(recentLead) : null}
        items={recentRest.map(withMeta)}
      />



      {/* ----------------------------------------------- insights ---
          One large picture with the headline over it, three smaller stories
          stacked down the right — fed from the Insights section, newest
          first, so it reorders itself as pieces are published. */}
      {insightLead && (
        <section className="bg-bar-2">
          <div className="mx-auto max-w-[1430px] px-[10px] pb-20 pt-[70px] sm:px-5">
            <Head title="Insights" href="/smart-money-insights" tone="light" />
            <Reveal>
              <BigGroup lead={withMeta(insightLead)} rest={insightRest.map(withMeta)} />
            </Reveal>
          </div>
        </section>
      )}

      {/* -------------------------------------- deep dive + sidebar ---
          "In depth" is hidden until the archive is deep enough to justify a
          five-article block — revisit in six to twelve months. The sidebar
          that lived beside it has been removed; the ad banner now sits in
          the rail where Explore Categories used to.
          To bring this back, restore the getSectionTiles import and query,
          the WideRow and CategoryTiles imports, `const deepDive = take(5)`,
          and uncomment:

      {deepDive.length > 0 && (
        <Band tone="tint" labelledBy="deepdive">
          <Head id="deepdive" title="In depth" href="/smart-money-insights" />
          <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
            <Reveal direction="left" className="min-w-0 flex-1">
              {deepDive.map((d) => (
                <WideRow
                  key={`${d.collection}-${d.id}`}
                  href={`/insight/${d.slug}`}
                  category={cat(d)}
                  title={d.title}
                  standfirst={d.standfirst}
                  byline={byline}
                  date={shortDate(d.publishedAt)}
                  media={d.featuredImage}
                />
              ))}
            </Reveal>

            <Reveal
              direction="right"
              delay={80}
              className="flex w-full flex-col gap-[30px] lg:sticky lg:top-[125px] lg:w-[350px] xl:w-[400px]"
            >
              <Panel title="Explore Categories">
                <CategoryTiles tiles={tiles} />
              </Panel>
            </Reveal>
          </div>
        </Band>
      )}

          ------------------------------------------------------------- */}

      {/* ----------------------------------------- highlight stories ---
          Hidden alongside "In depth" for the same reason: a five-slide
          carousel of a thin archive shows the same pieces twice. Restore the
          HighlightSlider import and `const highlight = take(5)` above, then
          uncomment:

      {highlight.length > 0 && (
        <Band tone="dark" labelledBy="highlight">
          <Head id="highlight" title="Highlight Stories" href="/smart-money-insights" tone="light" />
          <Reveal>
            <HighlightSlider
              slides={highlight.map((d) => ({
                slug: d.slug,
                category: cat(d),
                title: d.title,
                byline,
                date: shortDate(d.publishedAt),
                image: pic(d),
              }))}
            />
          </Reveal>
        </Band>
      )}

          ------------------------------------------------------------- */}

      {/* -------------------------------------------- ask the archive --- */}
      {s.showAiSearchPlaceholder && (
        <Band tone="white" labelledBy="ask">
          <Head id="ask" title="Ask the archive" />
          <div className="max-w-3xl">
            <AiSearch />
          </div>
        </Band>
      )}

      {/* ----------------------------------------------- global macro --- */}
      {macroLead && (
        <Band tone="white" labelledBy="macro">
          <Head id="macro" title="Global Macro" href="/global-macro" />
          <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
            <Reveal direction="left" className="min-w-0 flex-1">
              <LatestStories
                featured={withMeta(macroLead)}
                rail={macroRail.map(withMeta)}
                row={macroRow.map(withMeta)}
              />
            </Reveal>

            {/* The right-hand rail. The ad banner takes the position the
                Explore Categories panel used to hold; that block still runs
                full width higher up the page, so nothing is lost by giving
                the slot to advertising. Sticky below the menu bar, which is
                57px tall plus breathing room. */}
            <Reveal
              direction="right"
              delay={80}
              className="flex w-full flex-col gap-[30px] lg:sticky lg:top-[125px] lg:w-[350px] xl:w-[400px]"
            >
              <AdSlot variant="rail" />
            </Reveal>
          </div>
        </Band>
      )}

      {/* ---------------------------------------------- sector themes --- */}
      {themes.length > 0 && (
        <Band tone="white" labelledBy="themes">
          <Head id="themes" title="Sectoral Trends" href="/sectoral-trends" />
          {/* Same cards as before, four across — the row can now be paged
              once there are more than four. */}
          <Reveal>
            <CardCarousel perView={4} label="sectoral trends">
              {themes.map((t: any) => (
                <StackCard
                  key={t.id}
                  href={`/insight/${t.slug}`}
                  category={cardCategory(t.theme?.title ?? t.industry) || 'Sectoral Trends'}
                  title={t.title}
                  standfirst={t.standfirst}
                  byline={s.siteName}
                  date={shortDate(t.publishedAt)}
                  media={t.featuredImage}
                />
              ))}
            </CardCarousel>
          </Reveal>
        </Band>
      )}

      {/* ------------------------------------------------- newsletter --- */}
      <SubscribeBanner
        heading={s.newsletterHeading}
        finePrint={s.newsletterFinePrint}
        image={bannerPic}
      >
        <NewsletterForm
          heading={s.newsletterHeading}
          cta={s.newsletterCta}
          variant="banner"
        />
      </SubscribeBanner>
    </>
  )
}
