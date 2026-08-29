'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export type Tile = {
  id: any
  title: string
  href: string
  count: number
  image?: string | null
}

const GAP = 20
const INTERVAL = 3000
const SPEED = 500

/**
 * Explore Categories.
 *
 * Five tiles to a page on desktop, sliding one at a time and looping, which is
 * how the reference's swiper is configured. The track is duplicated so the
 * wrap-around never shows a gap: when the first copy runs out the transition
 * is switched off, the offset jumps back a full set, and it resumes.
 */
export function CategorySlider({ tiles }: { tiles: Tile[] }) {
  const [perView, setPerView] = useState(5)
  const [i, setI] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReduced(mq.matches)
    onMotion()
    mq.addEventListener('change', onMotion)

    const fit = () => {
      const w = window.innerWidth
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : w < 1536 ? 4 : 5)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => {
      mq.removeEventListener('change', onMotion)
      window.removeEventListener('resize', fit)
    }
  }, [])

  const loops = tiles.length > perView

  const advance = useCallback(() => {
    setAnimate(true)
    setI((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!loops || paused || reduced) return
    const t = setInterval(advance, INTERVAL)
    return () => clearInterval(t)
  }, [loops, paused, reduced, advance])

  // Once a whole set has passed, drop the transition and rewind by one set.
  // The frame is identical either side of the jump, so nothing is visible.
  useEffect(() => {
    if (i < tiles.length) return
    const t = setTimeout(() => {
      setAnimate(false)
      setI((n) => n - tiles.length)
    }, SPEED)
    return () => clearTimeout(t)
  }, [i, tiles.length])

  useEffect(() => {
    if (animate) return
    const raf = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(raf)
  }, [animate])

  if (!tiles.length) return null

  const shown = loops ? [...tiles, ...tiles] : tiles
  const step = 100 / perView

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex"
        style={{
          gap: `${GAP}px`,
          transform: `translate3d(calc(${-i * step}% - ${i * (GAP / perView)}px), 0, 0)`,
          transition: animate ? `transform ${SPEED}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
        }}
      >
        {shown.map((t, n) => (
          <Link
            key={`${t.id}-${n}`}
            href={t.href}
            aria-hidden={loops && n >= tiles.length}
            tabIndex={loops && n >= tiles.length ? -1 : 0}
            className="group flex shrink-0 flex-col gap-3.5 rounded-[10px] border border-rule p-3 transition-colors hover:border-ink"
            style={{ width: `calc(${step}% - ${(GAP * (perView - 1)) / perView}px)` }}
          >
            <span className="relative block h-[148px] w-full overflow-hidden rounded-[6px] bg-sunken">
              {t.image && (
                <Image
                  src={t.image}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                />
              )}
            </span>
            <span className="flex items-center justify-between gap-3.5">
              <span className="min-w-0">
                <span className="mb-[5px] block truncate text-[18px] font-semibold leading-tight text-ink">
                  {t.title}
                </span>
                <span className="block text-[14px] leading-none text-ink-soft">
                  {t.count} {t.count === 1 ? 'Article' : 'Articles'}
                </span>
              </span>
              <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[3px] border border-rule text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
