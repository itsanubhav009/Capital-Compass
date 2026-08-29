import Link from 'next/link'
import {
  getFlowTape,
  getInsights,
  getPopular,
  getBrowseTiles,
  getSectionTiles,
  getSectorThemes,
  getSettings,
} from '@/lib/queries'
import { FlowTape } from '@/components/flow'
import { Band, ListRow, StackCard } from '@/components/cards'
import {
  BigGroup,
  CategoryTiles,
  FollowCards,
  Head,
  LatestStories,
  Panel,
  PopularList,
  RoundStrip,
  SubscribeBanner,
  WideRow,
} from '@/components/sections'
import { HighlightSlider } from '@/components/highlight-slider'
import { CategorySlider } from '@/components/category-slider'
import { Reveal } from '@/components/reveal'
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
  const [settings, tape, themes, latest, tiles, popular, browse] = await Promise.all([
    getSettings(),
    getFlowTape(6),
    getSectorThemes(4),
    getInsights({ limit: 36 }),
    getSectionTiles(),
    getPopular(3),
    getBrowseTiles(),
  ])
  const s: any = settings
  const docs = latest.docs
  const byline = s.siteName

  // Blocks are filled from a rolling cursor rather than fixed offsets. Fixed
  // slices silently render nothing once the archive is shorter than the last
  // index, which is how the In depth block disappeared and let two sections
  // run together. Wrapping repeats a piece on a thin archive; an empty
  // section is the worse failure.
  let cursor = 0
  const take = (n: number) => {
    if (!docs.length) return []
    const out: any[] = []
    for (let k = 0; k < n; k++) out.push(docs[(cursor + k) % docs.length])
    cursor = (cursor + n) % docs.length
    return out
  }

  const heroSlides = take(3)
  const hero = heroSlides[0]
  const leftCol = take(4)
  const rightCol = take(4)
  const strip = take(3)
  const video = take(4)
  const videoLead = video[0]
  const videoRest = video.slice(1)
  const deepDive = take(5)
  const highlight = take(5)
  const storyLead = take(1)[0]
  const storyRail = take(3)
  const storyRow = take(3)

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

      {/* ------------------------------------- explore categories --- */}
      {browse.length > 0 && (
        <Band tone="white" labelledBy="explore">
          <Head id="explore" title="Explore Categories" href="/global-macro" />
          <Reveal>
            <CategorySlider tiles={browse} />
          </Reveal>
        </Band>
      )}

      {/* ------------------------------------------- in focus strip --- */}
      <RoundStrip backdrop={backdrop} items={strip.map(withMeta)} />

      {/* --------------------------------- institutional activity --- */}
      <FlowTape heading={s.flowTapeHeading} rows={tape} />

      {/* -------------------------------------------- video news --- */}
      {videoLead && (
        <section className="bg-bar-2">
          <div className="mx-auto max-w-[1430px] px-[10px] pb-20 pt-[70px] sm:px-5">
            <Head title="Video News" href="/global-macro" tone="light" />
            <Reveal>
              <BigGroup lead={withMeta(videoLead)} rest={videoRest.map(withMeta)} />
            </Reveal>
          </div>
        </section>
      )}

      {/* -------------------------------------- deep dive + sidebar --- */}
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
                  views={d.views ?? 0}
                  date={shortDate(d.publishedAt)}
                  media={d.featuredImage}
                />
              ))}
            </Reveal>

            {/* Sticky below the menu bar, which is 57px tall plus breathing
                room, matching the reference's 125px offset. */}
            <Reveal
              direction="right"
              delay={80}
              className="flex w-full flex-col gap-[30px] lg:sticky lg:top-[125px] lg:w-[350px] xl:w-[400px]"
            >
              <Panel title="Explore Categories">
                <CategoryTiles tiles={tiles} />
              </Panel>

              {popular.length > 0 && (
                <Panel title="Popular News">
                  <PopularList items={popular.map(withMeta)} />
                </Panel>
              )}

              <Panel title="Follow Us">
                <FollowCards />
              </Panel>
            </Reveal>
          </div>
        </Band>
      )}

      {/* ----------------------------------------- highlight stories --- */}
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
              views: d.views ?? 0,
              date: shortDate(d.publishedAt),
                image: pic(d),
              }))}
            />
          </Reveal>
        </Band>
      )}

      {/* -------------------------------------------- ask the archive --- */}
      {s.showAiSearchPlaceholder && (
        <Band tone="white" labelledBy="ask">
          <Head id="ask" title="Ask the archive" />
          <div className="max-w-3xl">
            <AiSearch />
          </div>
        </Band>
      )}

      {/* --------------------------------------------- latest stories --- */}
      {storyLead && (
        <Band tone="white" labelledBy="latest">
          <Head id="latest" title="Latest Stories" href="/global-macro" />
          <Reveal>
            <LatestStories
              featured={withMeta(storyLead)}
              rail={storyRail.map(withMeta)}
              row={storyRow.map(withMeta)}
            />
          </Reveal>
        </Band>
      )}

      {/* ---------------------------------------------- sector themes --- */}
      {themes.length > 0 && (
        <Band tone="white" labelledBy="themes">
          <Head id="themes" title="Sector Themes" href="/sectoral-trends" />
          <Reveal>
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
