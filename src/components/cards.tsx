import Link from 'next/link'
import Image from 'next/image'

/* -------------------------------------------------------------- view icon */

function PulseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" className={className} aria-hidden>
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
      {byline && <span>By {byline}</span>}
      {typeof views === 'number' && (
        <span className="flex items-center gap-1.5">
          <PulseIcon />
          <span className="tnum">{views.toLocaleString('en-IN')}</span> Views
        </span>
      )}
      {date && (
        <span className="flex items-center gap-1.5">
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

/* ------------------------------------------------------------- list row */

/**
 * Horizontal row: square thumbnail left, category and headline right.
 * The repeating unit in both hero side columns.
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
    <article className="group flex gap-4 py-5">
      <Link href={href} className="relative block h-[92px] w-[124px] shrink-0 overflow-hidden rounded-md bg-sunken sm:h-[104px] sm:w-[140px]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="140px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-wider text-ink-faint">
            No image
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <span className="kicker">{category}</span>
        <h3 className="mt-1.5 text-[18px] leading-snug sm:text-[19px]">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {title}
          </Link>
        </h3>
        <div className="mt-2">
          <Meta byline={byline} views={views} />
        </div>
      </div>
    </article>
  )
}

/* ----------------------------------------------------------- hero card */

/** Full-bleed image with the headline set over a gradient scrim. */
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
    <article className="group relative min-h-[420px] overflow-hidden rounded-lg bg-bar lg:min-h-[620px]">
      {image && (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 700px"
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <span className="kicker kicker-light">{category}</span>
        <h2 className="mt-3 max-w-[18ch] text-[30px] text-white sm:text-[40px] lg:text-[44px]">
          <Link href={href}>
            <span className="absolute inset-0" aria-hidden />
            {title}
          </Link>
        </h2>
        <div className="mt-4">
          <Meta byline={byline} views={views} date={date} light />
        </div>
      </div>
    </article>
  )
}

/* ---------------------------------------------------------- stacked card */

/** Image above, text below. Used in grids beneath the hero. */
export function StackCard({
  href,
  category,
  title,
  standfirst,
  byline,
  views,
  date,
  media,
}: {
  href: string
  category: string
  title: string
  standfirst?: string | null
  byline?: string | null
  views?: number | null
  date?: string
  media?: any
}) {
  const image = img(media, 'card')
  return (
    <article className="group">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden rounded-md bg-sunken">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-wider text-ink-faint">
            No image
          </span>
        )}
      </Link>
      <div className="pt-4">
        <span className="kicker">{category}</span>
        <h3 className="mt-1.5 text-[20px] leading-snug">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {title}
          </Link>
        </h3>
        {standfirst && (
          <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-soft">
            {standfirst}
          </p>
        )}
        <div className="mt-3">
          <Meta byline={byline} views={views} date={date} />
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------- section header */

export function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-ink pb-2.5">
      <h2 className="text-[21px] font-extrabold uppercase tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 pb-0.5 text-[13.5px] font-medium text-accent hover:underline"
        >
          See all
        </Link>
      )}
    </div>
  )
}
