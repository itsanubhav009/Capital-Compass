'use client'

import { useEffect, useRef, useState } from 'react'

type Direction = 'up' | 'left' | 'right'

/**
 * Slides its children into place the first time they reach the viewport.
 *
 * Reveal-on-scroll is easy to overdo: anything that moves far, moves slowly,
 * or replays on the way back up reads as jank rather than polish. So the
 * travel is 24px, the curve is short, it fires once, and it is skipped
 * entirely under `prefers-reduced-motion`.
 *
 * Content is visible by default and only hidden once the observer is attached,
 * so a reader with JavaScript off never loses the page.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already on screen at mount — leave it alone rather than animating
    // something the reader is looking at.
    const box = el.getBoundingClientRect()
    if (box.top < window.innerHeight * 0.9) return

    setArmed(true)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )
    io.observe(el)

    // Belt and braces: if the observer never fires — a browser quirk, a
    // clipped ancestor, a tab restored mid-scroll — show the content anyway.
    // Nothing on this page is worth hiding behind an animation that failed.
    const failsafe = setTimeout(() => setShown(true), 2000)

    return () => {
      io.disconnect()
      clearTimeout(failsafe)
    }
  }, [])

  const hidden =
    direction === 'left'
      ? 'translate3d(-24px, 0, 0)'
      : direction === 'right'
        ? 'translate3d(24px, 0, 0)'
        : 'translate3d(0, 24px, 0)'

  return (
    <div
      ref={ref}
      className={className}
      style={
        armed
          ? {
              opacity: shown ? 1 : 0,
              transform: shown ? 'none' : hidden,
              transition: `opacity 500ms ease-out ${delay}ms, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
