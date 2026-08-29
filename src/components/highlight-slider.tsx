'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { Meta } from '@/components/cards'

export type Slide = {
  slug: string
  category: string
  title: string
  byline?: string | null
  views?: number | null
  date?: string
  image?: string | null
}

const words = (title: string, n: number) => {
  const parts = title.trim().split(/\s+/)
  return parts.length > n ? parts.slice(0, n).join(' ') : title
}

/**
 * Highlight Stories.
 *
 * Three 535px cards with the copy floated over the picture, and arrows that
 * appear on hover — the reference's `fpg-post-slider` in `style-floating`.
 * It pages by whole cards rather than cross-fading, so the arrows have
 * something visible to do when there are more than three stories.
 */
export function HighlightSlider({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = track.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }, [])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  if (!slides.length) return null
  const pageable = slides.length > 3

  return (
    <div className="group/slider relative">
      <ul
        ref={track}
        onScroll={sync}
        className={`grid gap-[30px] ${
          pageable
            ? 'snap-x snap-mandatory grid-flow-col auto-cols-[calc(100%-20px)] overflow-x-auto sm:auto-cols-[calc(50%-15px)] lg:auto-cols-[calc(33.333%-20px)] [&::-webkit-scrollbar]:hidden'
            : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
        style={pageable ? { scrollbarWidth: 'none' } : undefined}
      >
        {slides.map((s) => (
          <li key={s.slug} className="snap-start">
            <article className="group relative h-[400px] overflow-hidden rounded-[10px] bg-bar lg:h-[535px]">
              <Link href={`/insight/${s.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0 block">
                {s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 460px"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                )}
              </Link>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0) 18%, #121213 100%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 px-[30px] pb-[25px]">
                <span className="kicker kicker-light max-w-full">
                  <span className="truncate">{s.category}</span>
                </span>
                <h5 className="mt-3 line-clamp-3 text-[20px] leading-[1.44] text-white">
                  <Link
                    href={`/insight/${s.slug}`}
                    className="transition-colors duration-300 hover:text-white/85"
                  >
                    {words(s.title, 8)}
                  </Link>
                </h5>
                <div className="mt-3.5">
                  <Meta byline={s.byline} views={s.views} date={s.date} light />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {pageable && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            aria-label="Previous stories"
            disabled={atStart}
            className="absolute left-[10px] top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-rule/30 bg-bar/70 text-white opacity-0 transition-all duration-300 hover:border-accent hover:bg-accent disabled:cursor-default disabled:opacity-0 focus-visible:opacity-100 group-hover/slider:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden>
              <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            aria-label="Next stories"
            disabled={atEnd}
            className="absolute right-[10px] top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-rule/30 bg-bar/70 text-white opacity-0 transition-all duration-300 hover:border-accent hover:bg-accent disabled:cursor-default disabled:opacity-0 focus-visible:opacity-100 group-hover/slider:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden>
              <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
