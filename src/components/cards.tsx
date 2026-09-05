import Link from 'next/link'
import Image from 'next/image'

/* -------------------------------------------------------------- view icon */

function PulseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden>
      <path
        d="M1 10h3.2l2-5.5 3.4 11L12.6 10H19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Meta({
  byline,
  views,
  date,
  light = false,
}: {
  byline?: string | null
  views?: number | null
  date?: string
  light?: boolean
}) {
  const tone = light ? 'text-white/80' : 'text-ink-soft'
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] ${tone}`}>
      {byline && <span className="whitespace-nowrap">By {byline}</span>}
      {typeof views === 'number' && (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <PulseIcon />
          <span className="tnum">{views.toLocaleString('en-IN')}</span> Views
        </span>
      )}
      {date && (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="2.5" y="4" width="15" height="13" rx="1.5" />
            <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" strokeLinecap="round" />
          </svg>
          {date}
        </span>
      )}
    </div>
  )
}

const img = (m: any, size: 'thumb' | 'card' | 'wide' = 'card') =>
  m?.url ? { url: m.sizes?.[size]?.url ?? m.url, alt: m.alt ?? '' } : null

/**
 * The reference clips card headlines by word count, not by line, which is why
 * they read as "Small businesses adapt to new digital" — six words in the
 * rails, eight on the hero. Clamping by line instead leaves rows at uneven
 * heights whenever a long word forces an early wrap.
 */
const words = (title: string, n: number) => {
  const parts = title.trim().split(/\s+/)
  return parts.length > n ? parts.slice(0, n).join(' ') : title
}

/**
 * Category label.
 *
 * Never wraps. A two-line kicker in one rail and a one-line kicker in the
 * other throws the two columns out of alignment for the whole page, which is
 * far more visible than a truncated category name.
 */
function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`kicker max-w-full ${light ? 'kicker-light' : ''}`}>
      <span className="truncate">{children}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ band */

export function Band({
  tone = 'white',
  children,
  labelledBy,
}: {
  tone?: 'white' | 'tint' | 'dark'
  children: React.ReactNode
  labelledBy?: string
}) {
  const bg =
    tone === 'tint'
      ? 'bg-sunken border-y border-rule'
      : tone === 'dark'
        ? 'bg-bar text-white'
        : 'bg-white'

  return (
    <section aria-labelledby={labelledBy} className={bg}>
      <div className="mx-auto max-w-[1430px] px-[10px] py-[50px] sm:px-5">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------- list row */

/**
 * The repeating unit in both hero rails.
 *
 * Headline clamps to two lines. The reference does this and it is what keeps
 * every row the same height; without it a four-line headline makes one rail
 * far taller than the other and the whole block looks accidental.
 */
export function ListRow({
  href,
  category,
  title,
  byline,
  views,
  media,
}: {
  href: string
  category: string
  title: string
  byline?: string | null
  views?: number | null
  media?: any
}) {
  const image = img(media, 'thumb')
  return (
    <article className="group mb-[10px] flex items-center gap-[15px] border-b border-rule pb-[10px] last:mb-0 last:border-0 last:pb-0 2xl:gap-[25px]">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block h-[87px] w-[110px] shrink-0 overflow-hidden rounded-[10px] bg-sunken 2xl:h-[117px] 2xl:w-[140px]"
      >
        {image ? (
          <Image
            src={image.url}
            alt=""
            fill
            sizes="140px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-ink-faint/50">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 15l-5-5L5 19" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Kicker>{category}</Kicker>
        <h6 className="mb-[8px] mt-[5px] line-clamp-2 text-[16px] leading-[1.44] 2xl:text-[18px]">
          <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
            {words(title, 6)}
          </Link>
        </h6>
        <Meta byline={byline} views={views} />
      </div>
    </article>
  )
}

/* ----------------------------------------------------------- hero card */

export function HeroCard({
  href,
  category,
  title,
  byline,
  views,
  date,
  media,
}: {
  href: string
  category: string
  title: string
  byline?: string | null
  views?: number | null
  date?: string
  media?: any
}) {
  const image = img(media, 'wide')
  return (
    <article className="group relative h-full min-h-[440px] overflow-hidden rounded-[10px] bg-bar lg:min-h-[530px]">
      <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 block">
        {image && (
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            priority
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        )}
      </Link>

      {/* The theme's own .thumb-overlay: transparent to #121213, starting at
          18% rather than at the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0) 18%, #121213 100%)' }}
      />

      <div className="absolute inset-x-0 bottom-0 pb-[30px] pl-[35px] pr-[30px]">
        <Kicker light>{category}</Kicker>
        <h3 className="mt-3 line-clamp-3 max-w-[17ch] text-[24px] leading-[1.3] text-white sm:text-[28px]">
          <Link href={href} className="transition-colors duration-300 hover:text-white/85">
            {words(title, 8)}
          </Link>
        </h3>
        <div className="mt-4">
          <Meta byline={byline} views={views} date={date} light />
        </div>
      </div>
    </article>
  )
}

/* ---------------------------------------------------------- stack card */

export function StackCard({
  href,
  category,
  title,
  standfirst,
  byline,
  views,
  date,
  media,
  dark = false,
}: {
  href: string
  category: string
  title: string
  standfirst?: string | null
  byline?: string | null
  views?: number | null
  date?: string
  media?: any
  dark?: boolean
}) {
  const image = img(media, 'card')
  return (
    <article className="group">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-16/10 overflow-hidden rounded-[10px] bg-sunken"
      >
        {image ? (
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 380px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-ink-faint/50">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 15l-5-5L5 19" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </Link>
      <div className="pt-4">
        <Kicker light={dark}>{category}</Kicker>
        <h5 className={`mb-[7px] mt-[9px] line-clamp-2 text-[20px] leading-[1.44] ${dark ? 'text-white' : ''}`}>
          <Link href={href} className="transition-colors duration-300 group-hover:text-accent">
            {words(title, 8)}
          </Link>
        </h5>
        {standfirst && (
          <p
            className={`mt-2 line-clamp-2 text-[14.5px] leading-relaxed ${
              dark ? 'text-white/60' : 'text-ink-soft'
            }`}
          >
            {standfirst}
          </p>
        )}
        <div className="mt-3">
          <Meta byline={byline} views={views} date={date} light={dark} />
        </div>
      </div>
    </article>
  )
}
