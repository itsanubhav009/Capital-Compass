'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Preloader shown on first paint only.
 *
 * The reference runs one of these. Two constraints make it acceptable rather
 * than annoying: it never appears on subsequent navigations (the route progress
 * bar covers those), and it hides itself after 2s regardless of load state so
 * a slow connection can never trap someone behind a spinner.
 */
export function Preloader({ siteName = 'Capital Compass' }: { siteName?: string }) {
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Once per session. A preloader on every page view is intolerable.
    if (sessionStorage.getItem('cc-preloaded')) {
      setDone(true)
      return
    }

    const finish = () => {
      sessionStorage.setItem('cc-preloaded', '1')
      setDone(true)
    }

    if (document.readyState === 'complete') {
      const t = setTimeout(finish, 350)
      return () => clearTimeout(t)
    }

    window.addEventListener('load', finish)
    const failsafe = setTimeout(finish, 2000)
    return () => {
      window.removeEventListener('load', finish)
      clearTimeout(failsafe)
    }
  }, [])

  if (!mounted || done) return null

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[90] grid place-items-center bg-white transition-opacity duration-500"
      style={{ opacity: done ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Ring rotates, brand mark holds still inside it. */}
        <div className="relative h-16 w-16">
          <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '1.1s' }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-rule)" strokeWidth="3" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="44 132"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center">
            <span className="block h-2 w-2 rounded-full bg-dot" />
          </span>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-ink">{siteName}</span>
      </div>
    </div>
  )
}

/**
 * Reading progress along the top of the page.
 *
 * The reference exposes this as a CSS variable driven by scroll. Here it is a
 * transform on a fixed bar, which the compositor handles without touching
 * layout — a width animation on every scroll frame would cost far more.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        className="h-full origin-left bg-accent"
        style={{ transform: `scaleX(${pct})`, transition: 'transform 90ms linear' }}
      />
    </div>
  )
}
