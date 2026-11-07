'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { WholeImage } from '@/components/whole-image'

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
 *
 * Arrows sit over the picture band, translucent so they do not cover the
 * tile beneath. Always shown on a touch screen, which has no hover to reveal
 * them; on a desktop they appear when the rail is hovered.
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
      // Three at most. There are four sections with articles; showing four
      // or five across put every tile on screen at once, so the rail never
      // moved and its arrows had nothing to do.
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3)
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

  // Backwards from the first tile, jump silently to the same frame in the
  // second copy first, then animate one step back from there.
  const back = () => {
    if (i > 0) {
      setAnimate(true)
      setI((n) => n - 1)
      return
    }
    setAnimate(false)
    setI(tiles.length)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true)
        setI(tiles.length - 1)
      }),
    )
  }

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

  // Centred on the picture band: 12px of tile padding, then half of a 16:9
  // picture as wide as one tile less its padding, less half the button.
  const arrowTop = `calc(12px + ((100cqw - ${GAP * (perView - 1)}px) / ${perView} - 24px) * 9 / 32 - 20px)`
  // See-through until touched: a faint dark tint and a white chevron, so the
  // picture under it still reads, turning solid white only under the
  // pointer. Out of sight until the rail is hovered, then easing in from its
  // own edge. A touch screen has no hover, so there they simply stay.
  const arrow =
    'absolute z-10 grid h-10 w-10 place-items-center rounded-full border border-white/45 bg-black/15 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-[2px] opacity-0 transition-all duration-300 ease-out hover:scale-110 hover:border-white hover:bg-white hover:text-ink active:scale-95 focus-visible:translate-x-0 focus-visible:opacity-100 group-hover/rail:translate-x-0 group-hover/rail:opacity-100 pointer-coarse:translate-x-0 pointer-coarse:opacity-100'

  return (
    <div
      className="group/rail relative @container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
    <div className="overflow-hidden">
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
            {/* 16:9, the shape most article pictures are made in, shown
                whole — a fixed 148px strip cut the sides off every graphic. */}
            <span className="relative block aspect-video w-full overflow-hidden rounded-[6px] bg-bar">
              {t.image && (
                <WholeImage
                  src={t.image}
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="transition-transform duration-300 ease-out group-hover:scale-105"
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

      {loops && (
        <>
          <button
            type="button"
            onClick={back}
            aria-label="Previous categories"
            className={`${arrow} left-3 -translate-x-4`}
            style={{ top: arrowTop }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={advance}
            aria-label="Next categories"
            className={`${arrow} right-3 translate-x-4`}
            style={{ top: arrowTop }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
