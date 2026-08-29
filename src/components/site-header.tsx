'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

type Preview = { slug: string; title: string; image?: string | null; date?: string }
type NavChild = { title: string; slug: string }
type NavItem = { key: string; title: string; slug?: string; children?: NavChild[] }
type Tag = { title: string; slug: string }
type Headline = { title: string; slug: string }

/* --------------------------------------------------------------- icons */

/* Paths taken from the reference markup so the glyphs are the same shapes,
   not lookalikes. */

const SOCIAL = [
  {
    label: 'Facebook',
    href: '#',
    box: '0 0 320 512',
    d: 'M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z',
  },
  {
    label: 'Instagram',
    href: '#',
    box: '0 0 448 512',
    d: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    box: '0 0 448 512',
    d: 'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z',
  },
  {
    label: 'Pinterest',
    href: '#',
    box: '0 0 384 512',
    d: 'M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z',
  },
]

function CalendarIcon() {
  return (
    <svg viewBox="0 0 14 16" width="13" height="15" fill="currentColor" aria-hidden>
      <path d="M4.33447 3.8335C4.06114 3.8335 3.83447 3.60683 3.83447 3.3335V1.3335C3.83447 1.06016 4.06114 0.833496 4.33447 0.833496C4.60781 0.833496 4.83447 1.06016 4.83447 1.3335V3.3335C4.83447 3.60683 4.60781 3.8335 4.33447 3.8335ZM9.66781 3.8335C9.39447 3.8335 9.16781 3.60683 9.16781 3.3335V1.3335C9.16781 1.06016 9.39447 0.833496 9.66781 0.833496C9.94114 0.833496 10.1678 1.06016 10.1678 1.3335V3.3335C10.1678 3.60683 9.94114 3.8335 9.66781 3.8335ZM4.66781 9.66683C4.58114 9.66683 4.49447 9.64683 4.41447 9.6135C4.32781 9.58016 4.26114 9.5335 4.19447 9.4735C4.07447 9.34683 4.00114 9.18016 4.00114 9.00016C4.00114 8.9135 4.02114 8.82683 4.05447 8.74683C4.08781 8.66683 4.13447 8.5935 4.19447 8.52683C4.26114 8.46683 4.32781 8.42016 4.41447 8.38683C4.65447 8.28683 4.95447 8.34016 5.14114 8.52683C5.26114 8.6535 5.33447 8.82683 5.33447 9.00016C5.33447 9.04016 5.32781 9.08683 5.32114 9.1335C5.31447 9.1735 5.30114 9.2135 5.28114 9.2535C5.26781 9.2935 5.24781 9.3335 5.22114 9.3735C5.20114 9.40683 5.16781 9.44016 5.14114 9.4735C5.01447 9.5935 4.84114 9.66683 4.66781 9.66683ZM7.00114 9.66683C6.91447 9.66683 6.82781 9.64683 6.74781 9.6135C6.66114 9.58016 6.59447 9.5335 6.52781 9.4735C6.40781 9.34683 6.33447 9.18016 6.33447 9.00016C6.33447 8.9135 6.35447 8.82683 6.38781 8.74683C6.42114 8.66683 6.46781 8.5935 6.52781 8.52683C6.59447 8.46683 6.66114 8.42016 6.74781 8.38683C6.98781 8.28016 7.28781 8.34016 7.47447 8.52683C7.59447 8.6535 7.66781 8.82683 7.66781 9.00016C7.66781 9.04016 7.66114 9.08683 7.65447 9.1335C7.64781 9.1735 7.63447 9.2135 7.61447 9.2535C7.60114 9.2935 7.58114 9.3335 7.55447 9.3735C7.53447 9.40683 7.50114 9.44016 7.47447 9.4735C7.34781 9.5935 7.17447 9.66683 7.00114 9.66683ZM9.33447 9.66683C9.24781 9.66683 9.16114 9.64683 9.08114 9.6135C8.99447 9.58016 8.92781 9.5335 8.86114 9.4735L8.78114 9.3735C8.75589 9.33635 8.73571 9.29599 8.72114 9.2535C8.70188 9.21572 8.6884 9.17527 8.68114 9.1335C8.67447 9.08683 8.66781 9.04016 8.66781 9.00016C8.66781 8.82683 8.74114 8.6535 8.86114 8.52683C8.92781 8.46683 8.99447 8.42016 9.08114 8.38683C9.32781 8.28016 9.62114 8.34016 9.80781 8.52683C9.92781 8.6535 10.0011 8.82683 10.0011 9.00016C10.0011 9.04016 9.99447 9.08683 9.98781 9.1335C9.98114 9.1735 9.96781 9.2135 9.94781 9.2535C9.93447 9.2935 9.91447 9.3335 9.88781 9.3735C9.86781 9.40683 9.83447 9.44016 9.80781 9.4735C9.68114 9.5935 9.50781 9.66683 9.33447 9.66683ZM4.66781 12.0002C4.58114 12.0002 4.49447 11.9802 4.41447 11.9468C4.33447 11.9135 4.26114 11.8668 4.19447 11.8068C4.07447 11.6802 4.00114 11.5068 4.00114 11.3335C4.00114 11.2468 4.02114 11.1602 4.05447 11.0802C4.08781 10.9935 4.13447 10.9202 4.19447 10.8602C4.44114 10.6135 4.89447 10.6135 5.14114 10.8602C5.26114 10.9868 5.33447 11.1602 5.33447 11.3335C5.33447 11.5068 5.26114 11.6802 5.14114 11.8068C5.01447 11.9268 4.84114 12.0002 4.66781 12.0002ZM7.00114 12.0002C6.82781 12.0002 6.65447 11.9268 6.52781 11.8068C6.40781 11.6802 6.33447 11.5068 6.33447 11.3335C6.33447 11.2468 6.35447 11.1602 6.38781 11.0802C6.42114 10.9935 6.46781 10.9202 6.52781 10.8602C6.77447 10.6135 7.22781 10.6135 7.47447 10.8602C7.53447 10.9202 7.58114 10.9935 7.61447 11.0802C7.64781 11.1602 7.66781 11.2468 7.66781 11.3335C7.66781 11.5068 7.59447 11.6802 7.47447 11.8068C7.34781 11.9268 7.17447 12.0002 7.00114 12.0002ZM9.33447 12.0002C9.16114 12.0002 8.98781 11.9268 8.86114 11.8068C8.79945 11.7442 8.75174 11.6692 8.72114 11.5868C8.68781 11.5068 8.66781 11.4202 8.66781 11.3335C8.66781 11.2468 8.68781 11.1602 8.72114 11.0802C8.75447 10.9935 8.80114 10.9202 8.86114 10.8602C9.01447 10.7068 9.24781 10.6335 9.46114 10.6802C9.50781 10.6868 9.54781 10.7002 9.58781 10.7202C9.62781 10.7335 9.66781 10.7535 9.70781 10.7802C9.74114 10.8002 9.77447 10.8335 9.80781 10.8602C9.92781 10.9868 10.0011 11.1602 10.0011 11.3335C10.0011 11.5068 9.92781 11.6802 9.80781 11.8068C9.68114 11.9268 9.50781 12.0002 9.33447 12.0002ZM12.6678 6.56016H1.33447C1.06114 6.56016 0.834473 6.3335 0.834473 6.06016C0.834473 5.78683 1.06114 5.56016 1.33447 5.56016H12.6678C12.9411 5.56016 13.1678 5.78683 13.1678 6.06016C13.1678 6.3335 12.9411 6.56016 12.6678 6.56016Z" />
      <path d="M9.66667 15.1668H4.33333C1.9 15.1668 0.5 13.7668 0.5 11.3335V5.66683C0.5 3.2335 1.9 1.8335 4.33333 1.8335H9.66667C12.1 1.8335 13.5 3.2335 13.5 5.66683V11.3335C13.5 13.7668 12.1 15.1668 9.66667 15.1668ZM4.33333 2.8335C2.42667 2.8335 1.5 3.76016 1.5 5.66683V11.3335C1.5 13.2402 2.42667 14.1668 4.33333 14.1668H9.66667C11.5733 14.1668 12.5 13.2402 12.5 11.3335V5.66683C12.5 3.76016 11.5733 2.8335 9.66667 2.8335H4.33333Z" />
    </svg>
  )
}

function CloudSunIcon() {
  return (
    <svg viewBox="0 0 640 512" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M575.2 325.7c.2-1.9.8-3.7.8-5.6 0-35.3-28.7-64-64-64-12.6 0-24.2 3.8-34.1 10-17.6-38.8-56.5-66-101.9-66-61.8 0-112 50.1-112 112 0 3 .7 5.8.9 8.7-49.6 3.7-88.9 44.7-88.9 95.3 0 53 43 96 96 96h272c53 0 96-43 96-96 0-42.1-27.2-77.4-64.8-90.4zm-430.4-22.6c-43.7-43.7-43.7-114.7 0-158.3 43.7-43.7 114.7-43.7 158.4 0 9.7 9.7 16.9 20.9 22.3 32.7 9.8-3.7 20.1-6 30.7-7.5L386 81.1c4-11.9-7.3-23.1-19.2-19.2L279 91.2 237.5 8.4C232-2.8 216-2.8 210.4 8.4L169 91.2 81.1 61.9C69.3 58 58 69.3 61.9 81.1l29.3 87.8-82.8 41.5c-11.2 5.6-11.2 21.5 0 27.1l82.8 41.4-29.3 87.8c-4 11.9 7.3 23.1 19.2 19.2l76.1-25.3c6.1-12.4 14-23.7 23.6-33.5-13.1-5.4-25.4-13.4-36-24zm-4.8-79.2c0 40.8 29.3 74.8 67.9 82.3 8-4.7 16.3-8.8 25.2-11.7 5.4-44.3 31-82.5 67.4-105C287.3 160.4 258 140 224 140c-46.3 0-84 37.6-84 83.9z" />
    </svg>
  )
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 17" width="22" height="16" fill="currentColor" aria-hidden>
      <path d="M18 1.2C18 0.537282 17.4627 0 16.8 0H1.2C0.5373 0 0 0.537282 0 1.2C0 1.86272 0.5373 2.4 1.2 2.4H16.8C17.4627 2.4 18 1.86267 18 1.2ZM1.2 7.2H22.8C23.4627 7.2 24 7.73733 24 8.4C24 9.06272 23.4627 9.6 22.8 9.6H1.2C0.5373 9.6 0 9.06272 0 8.4C0 7.73733 0.5373 7.2 1.2 7.2ZM1.2 14.4H12C12.6627 14.4 13.2 14.9373 13.2 15.6C13.2 16.2627 12.6627 16.8 12 16.8H1.2C0.5373 16.8 0 16.2627 0 15.6C0 14.9373 0.5373 14.4 1.2 14.4Z" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
      className={`ml-[5px] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
    </svg>
  )
}

/* ------------------------------------------------------- headline ticker */

/**
 * The top-bar headline reel.
 *
 * One line is visible at a time; the outgoing line slides up out of a 22px
 * window while the next slides in from below, which is what the theme's
 * `.fpg-ticker-title` transition does.
 */
function Ticker({ headlines }: { headlines: Headline[] }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (headlines.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % headlines.length), 4000)
    return () => clearInterval(t)
  }, [headlines.length])

  if (!headlines.length) return null

  const prev = (i - 1 + headlines.length) % headlines.length

  return (
    <div className="flex min-w-0 items-center lg:w-[500px] lg:shrink-0">
      <div className="flex shrink-0 items-center gap-2">
        <span aria-hidden className="ticker-dot" />
        <p className="mr-[10px] border-r border-[rgba(242,242,242,0.5)] pr-[10px] text-[13px] font-medium uppercase leading-none text-[#e40101]">
          Live News
        </p>
      </div>
      <div className="ticker-window">
        {headlines.map((h, n) => (
          <p
            key={h.slug}
            className="ticker-line truncate text-[14px] font-normal leading-[22px]"
            data-state={n === i ? 'active' : n === prev ? 'leaving' : 'idle'}
            aria-hidden={n !== i}
          >
            <Link
              href={`/insight/${h.slug}`}
              className="block truncate text-white/85 transition-colors hover:text-white"
              tabIndex={n === i ? 0 : -1}
            >
              {h.title}
            </Link>
          </p>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- tag rail */

/** Themes, scrolled a page at a time by the two arrows on its right. */
function TagRail({ tags }: { tags: Tag[] }) {
  const rail = useRef<HTMLDivElement>(null)

  const nudge = useCallback((dir: 1 | -1) => {
    const el = rail.current
    if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.6), behavior: 'smooth' })
  }, [])

  if (!tags.length) return null

  return (
    <div className="ml-auto hidden min-w-0 flex-1 items-center overflow-hidden pl-10 pr-[30px] xl:flex">
      <div ref={rail} className="tag-rail min-w-0 flex-1">
        {tags.map((t) => (
          <Link key={t.slug} href={`/sectoral-trends?theme=${t.slug}`}>
            {t.title}
          </Link>
        ))}
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Previous topics"
          className="text-white/90 transition-colors hover:text-accent"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
            <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Next topics"
          className="text-white/90 transition-colors hover:text-accent"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
            <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- menu item */

/**
 * A top-level menu entry.
 *
 * Three shapes, all sharing the same trigger: a plain link, a link with a
 * narrow dropdown of child sections (Capital Flow → India, International),
 * and a link with a wide preview panel of recent articles.
 */
function NavEntry({
  item,
  previews,
  active,
}: {
  item: NavItem
  previews: Preview[]
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Short close delay so the pointer can travel from the trigger to the panel
  // without the menu snapping shut under it.
  const enter = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 140)
  }

  const children = item.children ?? []
  const hasChildren = children.length > 0
  const hasPreviews = !hasChildren && previews.length > 0
  const href = item.slug ? `/${item.slug}` : children[0] ? `/${children[0].slug}` : '#'

  const panel = (visible: boolean) =>
    visible
      ? 'pointer-events-auto translate-y-0 opacity-100'
      : 'pointer-events-none translate-y-[15px] opacity-0'

  return (
    <li className="relative py-[17px]" onMouseEnter={enter} onMouseLeave={leave}>
      <Link
        href={href}
        className={`mr-[30px] flex items-center text-[16px] font-medium leading-[1.4] transition-colors duration-300 xl:mr-[40px] 2xl:mr-[48px] ${
          active ? 'text-accent' : 'text-white hover:text-accent'
        }`}
        aria-expanded={hasChildren || hasPreviews ? open : undefined}
      >
        {item.title}
        {(hasChildren || hasPreviews) && <Chevron open={open} />}
      </Link>

      {hasChildren && (
        <ul
          className={`absolute left-0 top-full z-50 w-[280px] rounded-b-[5px] bg-[#121418] shadow-[0_2px_35px_0_rgba(0,0,0,0.04)] transition-[opacity,transform] duration-300 ${panel(open)}`}
        >
          {children.map((c, n) => (
            <li key={c.slug} className={n < children.length - 1 ? 'border-b border-white/[0.07]' : ''}>
              <Link
                href={`/${c.slug}`}
                className="block px-5 py-3 text-[15px] font-medium leading-[1.4] text-white transition-colors duration-300 hover:text-accent"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasPreviews && (
        <div
          className={`absolute left-0 top-full z-50 w-[560px] rounded-b-[5px] border border-rule bg-white shadow-[0_2px_35px_0_rgba(0,0,0,0.14)] transition-[opacity,transform] duration-300 ${panel(open)}`}
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <span className="kicker">{item.title}</span>
            <Link href={href} className="text-[13px] font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-1 p-4">
            {previews.slice(0, 4).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/insight/${p.slug}`}
                  className="group flex gap-3 rounded p-2 transition-colors hover:bg-sunken"
                >
                  <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded bg-sunken">
                    {p.image && <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink group-hover:text-accent">
                      {p.title}
                    </span>
                    {p.date && <span className="tnum mt-1 block text-[11px] text-ink-faint">{p.date}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

/* ---------------------------------------------------------------- header */

export function SiteHeader({
  siteName,
  nav,
  headlines = [],
  previews = {},
  tags = [],
  promo,
}: {
  siteName: string
  nav: NavItem[]
  headlines?: Headline[]
  previews?: Record<string, Preview[]>
  tags?: Tag[]
  promo?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [today, setToday] = useState('')
  const pathname = usePathname()

  // Rendered on the client so the server's timezone never leaks into the date.
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    )
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  const isActive = (item: NavItem) =>
    item.slug
      ? pathname === `/${item.slug}`
      : (item.children ?? []).some((c) => pathname === `/${c.slug}`)

  return (
    <header>
      {/* ------------------------------------------------- utility bar --- */}
      <div className="bg-bar-2 text-white">
        <div className="mx-auto flex max-w-[1430px] flex-wrap items-center px-[10px]">
          <div className="flex min-w-0 flex-1 items-center gap-5 py-[10px] lg:py-0">
            <Ticker headlines={headlines} />

            {/* Weather readout. Static in the reference too. */}
            <div className="hidden items-center gap-[10px] sm:flex">
              <span className="text-white">
                <CloudSunIcon />
              </span>
              <span className="text-[14px] font-normal text-white/85">
                28.3
                <sup className="ml-[2px] text-[10px]">°C</sup>
              </span>
              <span className="text-[14px] text-white/85">California</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5 py-[10px] pl-[10px]">
            <div className="hidden items-center gap-[10px] rounded-[0_40px_40px_35px] bg-accent py-[3px] pl-[10px] pr-[12px] text-white lg:flex">
              <CalendarIcon />
              <span className="text-[12px] font-medium leading-[22px]">{today || ' '}</span>
            </div>

            <span className="hidden text-[14px] text-white xl:block">Follow Us:</span>

            <div className="hidden items-center gap-[15px] xl:flex">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-white/85 transition-colors duration-300 hover:text-accent"
                >
                  <svg viewBox={s.box} width="14" height="14" fill="currentColor" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- logo row --- */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-[1430px] flex-col items-center gap-[10px] px-[10px] py-[10px] lg:flex-row">
          <div className="flex w-full items-center gap-6 pl-[10px] lg:w-auto lg:flex-1 lg:gap-[80px]">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[5px] border border-rule bg-white text-ink transition-colors duration-300 hover:text-accent"
            >
              <BurgerIcon />
            </button>

            <Link href="/" className="flex shrink-0 items-baseline gap-2">
              <span className="text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">
                {siteName}
              </span>
              <span aria-hidden className="hidden h-2 w-2 rounded-full bg-dot sm:block" />
            </Link>
          </div>

          {promo && (
            <div className="hidden min-w-0 max-w-[720px] justify-end lg:flex lg:pr-[10px]">{promo}</div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- nav --- */}
      <div className="sticky top-0 z-40 bg-bar text-white">
        <div className="mx-auto flex max-w-[1430px] items-center px-[10px]">
          <nav aria-label="Sections" className="hidden shrink-0 pl-[10px] lg:block">
            <ul className="flex flex-nowrap items-center">
              <li className="py-[17px]">
                <Link
                  href="/"
                  className={`mr-[24px] flex items-center whitespace-nowrap text-[16px] font-medium leading-[1.4] transition-colors duration-300 xl:mr-[32px] 2xl:mr-[40px] ${
                    pathname === '/' ? 'text-accent' : 'text-white hover:text-accent'
                  }`}
                >
                  Home
                </Link>
              </li>

              {nav.map((item) => (
                <NavEntry
                  key={item.key}
                  item={item}
                  previews={item.slug ? (previews[item.slug] ?? []) : []}
                  active={isActive(item)}
                />
              ))}

              <li className="py-[17px]">
                <Link
                  href="/contact"
                  className={`flex items-center whitespace-nowrap text-[16px] font-medium leading-[1.4] transition-colors duration-300 ${
                    pathname === '/contact' ? 'text-accent' : 'text-white hover:text-accent'
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <TagRail tags={tags} />

          <div className="flex w-full items-center justify-between py-3 lg:hidden">
            <span className="text-[13px] font-medium text-white/70">Sections</span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[13px] font-semibold text-accent"
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- off-canvas panel --- */}
      <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-ink/70 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <nav
          aria-label="All sections"
          className={`absolute inset-y-0 left-0 w-[86%] max-w-[400px] overflow-y-auto bg-white transition-transform duration-500 ease-in-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-rule px-[30px] py-5">
            <span className="text-[20px] font-bold text-ink">{siteName}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-accent text-white transition-colors hover:bg-accent-soft"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                <path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z" />
              </svg>
            </button>
          </div>

          <ul className="px-[30px] py-2">
            <li className="border-b border-rule">
              <Link href="/" className="block py-3.5 text-[16px] font-medium text-ink">
                Home
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.key} className="border-b border-rule">
                {item.slug ? (
                  <Link href={`/${item.slug}`} className="block py-3.5 text-[16px] font-medium text-ink">
                    {item.title}
                  </Link>
                ) : (
                  <>
                    <span className="block pt-3.5 text-[16px] font-medium text-ink">{item.title}</span>
                    <ul className="pb-2 pl-4">
                      {(item.children ?? []).map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/${c.slug}`}
                            className="block py-2 text-[15px] text-ink-soft hover:text-accent"
                          >
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
            <li>
              <Link href="/contact" className="block py-3.5 text-[16px] font-medium text-ink">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
