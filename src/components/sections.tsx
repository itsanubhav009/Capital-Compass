import Link from 'next/link'
import Image from 'next/image'
import { Meta } from '@/components/cards'

/* --------------------------------------------------------------- shared */

const img = (m: any, size: 'thumb' | 'card' | 'wide' = 'card') =>
  m?.url ? { url: m.sizes?.[size]?.url ?? m.url, alt: m.alt ?? '' } : null

/** Card headlines clip by word count in the reference, not by line. */
const words = (title: string, n: number) => {
  const parts = title.trim().split(/\s+/)
  return parts.length > n ? parts.slice(0, n).join(' ') : title
}

function Kicker({ children, tone = 'dark' }: { children: React.ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <span className={`kicker max-w-full ${tone === 'light' ? 'kicker-light' : ''}`}>
      <span className="truncate">{children}</span>
    </span>
  )
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 12" width={size} height={size} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2079 5.0991C14.0115 5.0991 12.0097 3.0991 12.0097 0.900901V0H10.2079V0.900901C10.2079 2.4991 10.9088 3.9982 12.0088 5.0991H0.892578V6.9009H12.0088C10.9088 8.0018 10.2079 9.5009 10.2079 11.0991V12H12.0097V11.0991C12.0097 8.9009 14.0115 6.9009 16.2079 6.9009H17.1088V5.0991H16.2079Z"
      />
    </svg>
  )
}

/**
 * Section heading with the theme's "View All" button on the right.
 *
 * The rule underneath is 1px, not the 2px I had before — at 32px/600 a heavy
 * rule reads as a divider rather than as part of the heading.
 */
export function Head({
  title,
  href,
  id,
  tone = 'dark',
}: {
  title: string
  href?: string
  id?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <div
      className={`mb-[30px] flex items-center justify-between gap-4 border-b pb-[18px] ${
        tone === 'light' ? 'border-white/15' : 'border-rule'
      }`}
    >
      <h2 id={id} className={`text-[24px] sm:text-[32px] ${tone === 'light' ? 'text-white' : ''}`}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className={`group flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[16px] font-medium transition-colors ${
            tone === 'light' ? 'text-white hover:text-accent' : 'text-ink hover:text-accent'
          }`}
        >
          View All
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight />
          </span>
        </Link>
      )}
    </div>
  )
}

/* ------------------------------------------------------- category tiles */

export type Tile = {
  id: any
  title: string
  slug?: string
  href?: string
  count: number
  image?: string | null
}

/** The sidebar list: picture behind the text under a 50% scrim. */
export function CategoryTiles({ tiles }: { tiles: (Tile & { href?: string })[] }) {
  if (!tiles.length) return null
  return (
    <div className="grid gap-3">
      {tiles.map((t) => (
        <Link
          key={t.id}
          href={t.href ?? `/${t.slug}`}
          className="group relative flex items-center justify-between gap-3.5 overflow-hidden rounded-[6px] p-3 text-white"
        >
          {t.image && <Image src={t.image} alt="" fill sizes="400px" className="object-cover" />}
          <span
            aria-hidden
            className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/60"
          />
          <span className="relative z-10 flex items-center gap-2 text-[16px] font-medium leading-none">
            {t.title}
            <span className="text-white/85">({t.count})</span>
          </span>
          <span className="relative z-10 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[2px] bg-white/20 transition-colors group-hover:bg-white group-hover:text-ink">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------- round strip */

/**
 * The band that sits over a photograph: circular 133px thumbnails, white
 * headlines, hairline rules above and below each card.
 *
 * The picture is the section's background with a transparent-to-#121213
 * gradient over it, so the cards read against solid colour while the top of
 * the image stays clean.
 */
export function RoundStrip({
  backdrop,
  items,
}: {
  backdrop?: string | null
  items: any[]
}) {
  if (!items.length) return null
  return (
    <section className="relative bg-bar-2">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
          priority={false}
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(rgba(2,1,1,0) 5%, #121213 91%)' }}
      />
      <div className="relative mx-auto max-w-[1430px] px-[10px] pb-[60px] pt-[220px] sm:px-5 lg:pt-[320px]">
        <ul className="grid gap-[30px] lg:grid-cols-3">
          {items.map((d) => {
            const image = img(d.featuredImage, 'thumb')
            const href = `/insight/${d.slug}`
            return (
              <li key={`${d.collection}-${d.id}`}>
                <article className="group flex items-center gap-5 border-y border-white/15 py-2.5">
                  <Link
                    href={href}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block h-[110px] w-[110px] shrink-0 overflow-hidden rounded-full bg-white/10 2xl:h-[133px] 2xl:w-[133px]"
                  >
                    {image && (
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        sizes="133px"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <span className="kicker text-[#adadad]">
                      <span className="truncate">{d.category}</span>
                    </span>
                    <h6 className="mb-[8px] mt-[5px] line-clamp-2 text-[16px] leading-[1.44] text-white 2xl:text-[18px]">
                      <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
                        {words(d.title, 8)}
                      </Link>
                    </h6>
                    <Meta byline={d.byline} light />
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- wide list card */

/** The Business list row: 410x230 picture, standfirst, full meta line. */
export function WideRow({
  href,
  category,
  title,
  standfirst,
  byline,
  date,
  media,
}: {
  href: string
  category: string
  title: string
  standfirst?: string | null
  byline?: string | null
  date?: string
  media?: any
}) {
  const image = img(media, 'card')
  return (
    <article className="group flex flex-col gap-5 border-t border-rule py-5 last:border-b sm:flex-row">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block h-[230px] w-full shrink-0 overflow-hidden rounded-[10px] bg-sunken sm:w-[320px] xl:w-[410px]"
      >
        {image && (
          <Image
            src={image.url}
            alt=""
            fill
            sizes="410px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1 sm:ml-[5px] sm:mr-5">
        <Kicker>{category}</Kicker>
        <h4 className="mb-[14px] mt-[12px] line-clamp-2 text-[20px] leading-[1.2] sm:text-[22px]">
          <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
            {title}
          </Link>
        </h4>
        {standfirst && (
          <p className="mb-4 line-clamp-2 text-[16px] leading-[1.65] text-ink-soft">{standfirst}</p>
        )}
        <Meta byline={byline} date={date} />
      </div>
    </article>
  )
}

/* ----------------------------------------------------------- popular list */

/** Sidebar list: 120x110 picture, headline clamped to two lines. */
export function PopularList({ items }: { items: any[] }) {
  return (
    <ul>
      {items.map((d) => {
        const image = img(d.featuredImage, 'thumb')
        const href = `/insight/${d.slug}`
        return (
          <li
            key={`${d.collection}-${d.id}`}
            className="border-b border-rule py-2.5 first:pt-0 last:border-0 last:pb-0"
          >
            <article className="group flex items-center gap-4">
              <Link
                href={href}
                tabIndex={-1}
                aria-hidden
                className="relative block h-[110px] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-sunken"
              >
                {image && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Kicker>{d.category}</Kicker>
                <h6 className="mb-[8px] mt-[5px] line-clamp-2 text-[16px] leading-[1.44]">
                  <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
                    {words(d.title, 8)}
                  </Link>
                </h6>
                <Meta byline={d.byline} />
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------------------------------------------------------- sidebar card */

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[10px] border border-rule bg-white px-5 pb-5 pt-5 xl:px-[30px] xl:pb-[30px]">
      <h3 className="mb-5 text-[22px] text-ink sm:text-[24px]">{title}</h3>
      {children}
    </section>
  )
}

/* ------------------------------------------------------ subscribe banner */

/**
 * "Subscribe News Updates!" — a single dark panel with a photograph bled in
 * from the right, 8px corners, 40px/65px padding. The form takes the left 43%
 * exactly as the reference does.
 */
export function SubscribeBanner({
  heading,
  cta,
  finePrint,
  image,
  children,
}: {
  heading: string
  cta?: string
  finePrint?: string
  image?: string | null
  children?: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-[1430px] px-[10px] pb-20 sm:px-5">
      <div className="relative overflow-hidden rounded-[8px] bg-bar-2 px-5 py-8 sm:px-10 xl:px-[65px]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="1430px"
            className="object-cover object-top opacity-60"
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #171a1e 0%, rgba(23,26,30,0.92) 45%, rgba(23,26,30,0.25) 100%)',
          }}
        />
        <div className="relative z-10 lg:w-[43%]">
          <h2 className="text-[24px] text-white sm:text-[28px]">{heading}</h2>
          <div className="mt-5">{children}</div>
          {finePrint && <p className="mt-3 text-[13px] text-white/60">{finePrint}</p>}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- latest stories */

/**
 * The Latest Stories block: one featured split card at 76%, a text-only rail
 * at 21%, and a three-across row of small cards underneath.
 *
 * The featured card is `row-reverse` in the reference — picture on the right,
 * copy on a #F7F7F7 ground on the left.
 */
export function LatestStories({
  featured,
  rail,
  row,
}: {
  featured: any
  rail: any[]
  row: any[]
}) {
  if (!featured) return null
  const image = img(featured.featuredImage, 'wide')
  const href = `/insight/${featured.slug}`

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-[30px] gap-y-5">
      {/* ------------------------------------------------ featured --- */}
      <article className="group flex w-full flex-col-reverse overflow-hidden rounded-[8px] bg-sunken lg:w-[calc(76%-15px)] lg:flex-row-reverse lg:items-center">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative block h-[260px] w-full shrink-0 overflow-hidden bg-sunken sm:h-[340px] lg:h-[445px] lg:w-[54%]"
        >
          {image && (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 610px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          )}
        </Link>

        <div className="min-w-0 flex-1 p-6 lg:py-8 lg:pl-[30px] lg:pr-6">
          <Kicker>{featured.category}</Kicker>
          <h3 className="mt-3 line-clamp-3 text-[24px] leading-[1.3] sm:text-[28px]">
            <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
              {words(featured.title, 7)}
            </Link>
          </h3>
          <div className="mt-4">
            <Meta byline={featured.byline} />
          </div>
          {featured.standfirst && (
            <p className="mt-6 line-clamp-3 text-[16px] leading-[1.65] text-ink-soft">
              {featured.standfirst}
            </p>
          )}
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-2.5 text-[16px] font-medium text-ink transition-colors hover:text-accent"
          >
            Read More
            <ArrowRight />
          </Link>
        </div>
      </article>

      {/* ------------------------------------------- headline rail --- */}
      {rail.length > 0 && (
        <div className="w-full lg:w-[calc(21%-15px)]">
          {rail.map((d, i) => (
            <article
              key={`${d.collection}-${d.id}`}
              className={`group border-b border-rule pb-[15px] ${
                i === 0 ? 'border-t pt-[15px]' : 'mt-[15px]'
              }`}
            >
              <Kicker>{d.category}</Kicker>
              <h6 className="mb-[8px] mt-[5px] line-clamp-3 text-[16px] leading-[1.44] 2xl:text-[18px]">
                <Link
                  href={`/insight/${d.slug}`}
                  className="transition-colors duration-300 group-hover:text-accent"
                >
                  {words(d.title, 7)}
                </Link>
              </h6>
              <Meta byline={d.byline} />
            </article>
          ))}
        </div>
      )}

      {/* --------------------------------------------- bottom row --- */}
      {row.length > 0 && (
        <ul className="mt-[15px] grid w-full gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
          {row.map((d) => {
            const t = img(d.featuredImage, 'thumb')
            const h = `/insight/${d.slug}`
            return (
              <li key={`${d.collection}-${d.id}`}>
                <article className="group flex items-start gap-[15px]">
                  <Link
                    href={h}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block h-[120px] w-[140px] shrink-0 overflow-hidden rounded-[10px] bg-sunken"
                  >
                    {t && (
                      <Image
                        src={t.url}
                        alt=""
                        fill
                        sizes="140px"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Kicker>{d.category}</Kicker>
                    <h6 className="mb-[8px] mt-[5px] line-clamp-2 text-[16px] leading-[1.44] 2xl:text-[18px]">
                      <Link href={h} className="transition-colors duration-300 group-hover:text-accent">
                        {words(d.title, 7)}
                      </Link>
                    </h6>
                    <Meta byline={d.byline} />
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ big group */

function PlayBadge() {
  return (
    <span className="absolute left-1/2 top-1/2 grid h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e80000] text-white">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6058 11.737 19.6678 12.0475 19.5146 12.2772C19.478 12.3322 19.431 12.3792 19.376 12.4158Z" />
      </svg>
    </span>
  )
}

/**
 * The 12-column group: one tall card on the left over columns 1–9, and the
 * rest stacked down columns 9–13. The reference uses it for Video News.
 *
 * The play badge appears only on items that actually carry a video, so an
 * archive of written pieces does not advertise something it cannot play.
 */
export function BigGroup({ lead, rest }: { lead: any; rest: any[] }) {
  if (!lead) return null
  const image = img(lead.featuredImage, 'wide')
  const href = `/insight/${lead.slug}`

  return (
    <div className="grid gap-[30px] lg:grid-cols-12">
      <article className="group relative col-span-full min-h-[380px] overflow-hidden rounded-[10px] bg-bar lg:col-span-8 lg:row-span-3 lg:min-h-[535px]">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 block">
          {image && (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          )}
        </Link>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0) 18%, #121213 100%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 px-[30px] pb-[27px]">
          <Kicker tone="light">{lead.category}</Kicker>
          <h3 className="mt-3 line-clamp-3 max-w-[24ch] text-[24px] leading-[1.3] text-white sm:text-[28px]">
            <Link href={href} className="transition-colors duration-300 hover:text-white/85">
              {words(lead.title, 10)}
            </Link>
          </h3>
          <div className="mt-4">
            <Meta byline={lead.byline} date={lead.date} light />
          </div>
        </div>
      </article>

      <div className="col-span-full lg:col-span-4">
        {rest.map((d) => {
          const t = img(d.featuredImage, 'thumb')
          const h = `/insight/${d.slug}`
          return (
            <article
              key={`${d.collection}-${d.id}`}
              className="group -mt-px flex items-center gap-5 border-y border-[#343434] py-2.5"
            >
              <Link
                href={h}
                tabIndex={-1}
                aria-hidden
                className="relative block h-[110px] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-white/10 2xl:h-[135px] 2xl:w-[140px]"
              >
                {t && (
                  <Image
                    src={t.url}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                )}
                {d.videoUrl && <PlayBadge />}
              </Link>
              <div className="min-w-0 flex-1">
                <span className="kicker text-[#adadad]">
                  <span className="truncate">{d.category}</span>
                </span>
                <h6 className="mb-[8px] mt-[5px] line-clamp-2 text-[16px] leading-[1.44] text-white 2xl:text-[18px]">
                  <Link href={h} className="transition-colors duration-300 group-hover:text-accent">
                    {words(d.title, 6)}
                  </Link>
                </h6>
                <Meta byline={d.byline} light />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
