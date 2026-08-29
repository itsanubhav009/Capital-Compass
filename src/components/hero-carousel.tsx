'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Meta } from '@/components/cards'

export type Slide = {
  slug: string
  category: string
  title: string
  byline?: string | null
  views?: number | null
  date?: string
  image?: string | null
  alt?: string
}

// The reference slider runs at 3s with a 500ms transition.
const INTERVAL = 3000

/**
 * Hero carousel. Cross-fade rather than slide, matching the reference.
 *
 * Every slide stays mounted and opacity is toggled, so the container never
 * changes height and the block contributes nothing to Cumulative Layout Shift.
 * Autoplay pauses on hover, on focus, and when the tab is hidden — a carousel
 * that keeps advancing while someone is reading it is the most common
 * complaint about this pattern.
 */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const go = useCallback(
    (n: number) => setIndex((i) => (n + slides.length) % slides.length),
    [slides.length],
  )

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return
    timer.current = setInterval(() => go(indexRef.current + 1), INTERVAL)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused, reduced, slides.length, go])

  // Kept in a ref so the interval above does not need to be torn down and
  // rebuilt on every slide change, which would reset the timing each time.
  const indexRef = useRef(index)
  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (!slides.length) return null

  return (
    <div
      className="group relative h-full min-h-[440px] overflow-hidden rounded-[10px] bg-bar lg:min-h-[530px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1)
        if (e.key === 'ArrowRight') go(index + 1)
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured stories"
    >
      {slides.map((s, i) => {
        const active = i === index
        return (
          <div
            key={s.slug}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: active ? 1 : 0 }}
            aria-hidden={!active}
            {...(!active ? { inert: '' as any } : {})}
          >
            {s.image && (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                priority={i === 0}
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              />
            )}
            {/* .thumb-overlay: transparent to #121213, starting at 18%. */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0) 18%, #121213 100%)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 pb-[30px] pl-[35px] pr-[30px]">
              <span className="kicker kicker-light">{s.category}</span>
              <h3 className="mt-3 line-clamp-3 max-w-[17ch] text-[24px] leading-[1.3] text-white sm:text-[28px]">
                <Link
                  href={`/insight/${s.slug}`}
                  className="transition-colors duration-300 hover:text-white/85"
                >
                  {s.title}
                </Link>
              </h3>
              <div className="mt-4">
                <Meta byline={s.byline} views={s.views} date={s.date} light />
              </div>
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          {/* .fpg-unique-slider arrows: 50px circles, hairline white border,
              hidden until the slider is hovered. */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous story"
            className="absolute left-[10px] top-1/2 z-10 grid h-[50px] w-[50px] -translate-y-1/2 place-items-center rounded-full border border-white/10 text-white opacity-0 transition-all duration-300 hover:border-accent hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next story"
            className="absolute right-[10px] top-1/2 z-10 grid h-[50px] w-[50px] -translate-y-1/2 place-items-center rounded-full border border-white/10 text-white opacity-0 transition-all duration-300 hover:border-accent hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
            </svg>
          </button>
        </>
      )}

      <span aria-live="polite" className="sr-only">
        {slides[index]?.title}
      </span>
    </div>
  )
}
