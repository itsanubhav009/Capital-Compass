'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const GAP = 28

/**
 * Scrolls a row of cards four at a time.
 *
 * The Sectoral Trends grid keeps its exact look — same cards, same widths, same
 * gaps — and only gains the ability to run past four. It advances by a whole
 * page rather than one card, so the row never comes to rest showing two
 * halves.
 *
 * Arrows hide when there is nothing to scroll to, and disappear entirely when
 * everything already fits; a control that cannot do anything is worse than no
 * control.
 */
export function CardCarousel({
  children,
  perView = 4,
  label = 'items',
}: {
  children: React.ReactNode[]
  perView?: number
  label?: string
}) {
  const track = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [scrollable, setScrollable] = useState(false)

  const sync = useCallback(() => {
    const el = track.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
    setScrollable(el.scrollWidth > el.clientWidth + 8)
  }, [])

  useEffect(() => {
    sync()
    const el = track.current
    if (!el) return
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sync])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  const count = Array.isArray(children) ? children.length : 0
  if (!count) return null

  return (
    <div className="group/car relative">
      <ul
        ref={track}
        onScroll={sync}
        className="grid snap-x snap-mandatory grid-flow-col overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{
          gap: `${GAP}px`,
          gridAutoColumns: `calc((100% - ${GAP * (perView - 1)}px) / ${perView})`,
          scrollbarWidth: 'none',
        }}
      >
        {children.map((child, i) => (
          <li key={i} className="snap-start">
            {child}
          </li>
        ))}
      </ul>

      {scrollable && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            aria-label={`Previous ${label}`}
            disabled={atStart}
            className="absolute -left-2 top-[38%] z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-rule bg-white text-ink shadow-[0_2px_10px_rgba(18,19,19,0.12)] transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
              <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            aria-label={`Next ${label}`}
            disabled={atEnd}
            className="absolute -right-2 top-[38%] z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-rule bg-white text-ink shadow-[0_2px_10px_rgba(18,19,19,0.12)] transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-0"
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
