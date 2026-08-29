'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Section = { id: any; title: string; slug: string }

const SOCIAL = [
  { label: 'Facebook', href: '#', d: 'M13 10h3l.5-3H13V5.5c0-.9.3-1.5 1.6-1.5H16.6V1.3C16.3 1.2 15.2 1 14 1c-2.5 0-4 1.5-4 4.3V7H7v3h3v8h3v-8z' },
  { label: 'Instagram', href: '#', d: 'M10 2.7c2.4 0 2.7 0 3.6.05.9.04 1.4.2 1.7.32.43.17.74.37 1.06.7.32.31.52.62.69 1.05.12.31.28.8.32 1.7.04.9.05 1.2.05 3.5s0 2.6-.05 3.5c-.04.9-.2 1.4-.32 1.7-.17.43-.37.74-.7 1.06-.31.32-.62.52-1.05.69-.31.12-.8.28-1.7.32-.9.04-1.2.05-3.6.05s-2.7 0-3.6-.05c-.9-.04-1.4-.2-1.7-.32a2.9 2.9 0 01-1.06-.7 2.9 2.9 0 01-.69-1.05c-.12-.31-.28-.8-.32-1.7C2.7 12.6 2.7 12.3 2.7 10s0-2.6.05-3.5c.04-.9.2-1.4.32-1.7.17-.43.37-.74.7-1.06.31-.32.62-.52 1.05-.69.31-.12.8-.28 1.7-.32.9-.04 1.2-.05 3.5-.05zM10 6.3a3.7 3.7 0 100 7.4 3.7 3.7 0 000-7.4zm0 6.1a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8zm4.7-6.2a.86.86 0 11-1.7 0 .86.86 0 011.7 0z' },
  { label: 'LinkedIn', href: '#', d: 'M5.4 17H2.6V7.8h2.8V17zM4 6.6a1.6 1.6 0 110-3.3 1.6 1.6 0 010 3.3zM17.4 17h-2.8v-4.5c0-1.07-.02-2.44-1.5-2.44-1.5 0-1.73 1.16-1.73 2.36V17H8.6V7.8h2.68v1.26h.04c.37-.7 1.28-1.45 2.64-1.45 2.82 0 3.44 1.86 3.44 4.28V17z' },
]

function Ticker({ headline, href }: { headline?: string; href?: string }) {
  if (!headline) return null
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-live">
        <span aria-hidden className="live-dot block h-2 w-2 rounded-full bg-live" />
        Latest
      </span>
      <span aria-hidden className="hidden h-3 w-px bg-white/20 sm:block" />
      <Link
        href={href ?? '/'}
        className="min-w-0 truncate text-[13.5px] text-white/85 transition-colors hover:text-white"
      >
        {headline}
      </Link>
    </div>
  )
}

/**
 * Three-tier header matching the reference layout.
 *
 * The top bar carries a single latest headline rather than a scrolling
 * ticker: the brief bans tickers, and a moving strip is the most reliable way
 * to fail the Cumulative Layout Shift target.
 */
export function SiteHeader({
  siteName,
  sections,
  latest,
  promo,
}: {
  siteName: string
  sections: Section[]
  latest?: { title: string; slug: string } | null
  promo?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const primary = sections.slice(0, 5)
  const rail = sections.slice(5)

  return (
    <header>
      {/* ---------------------------------------------------- utility bar */}
      <div className="bg-bar text-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-4 py-2.5 sm:px-6">
          <Ticker headline={latest?.title} href={latest ? `/insight/${latest.slug}` : undefined} />

          <div className="ml-auto flex shrink-0 items-center gap-4">
            <span className="tnum hidden bg-accent px-3 py-1.5 text-[12px] font-medium text-white lg:block">
              {today}
            </span>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-[12.5px] text-white/60">Follow</span>
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-white/65 transition-colors hover:text-white"
                >
                  <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- logo row */}
      <div className="border-b border-rule bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-rule transition-colors hover:border-ink lg:hidden"
          >
            <span aria-hidden className="block space-y-[5px]">
              <span className="block h-[2px] w-5 bg-ink" />
              <span className="block h-[2px] w-5 bg-ink" />
              <span className="block h-[2px] w-3.5 bg-ink" />
            </span>
          </button>

          <Link href="/" className="flex shrink-0 items-baseline gap-2">
            <span className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
              {siteName}
            </span>
            <span aria-hidden className="hidden h-2 w-2 rounded-full bg-dot sm:block" />
          </Link>

          {promo && <div className="ml-auto hidden min-w-0 lg:block">{promo}</div>}
        </div>
      </div>

      {/* ------------------------------------------------------------ nav */}
      <div className="sticky top-0 z-40 bg-bar-2 text-white">
        <div className="mx-auto flex max-w-[1400px] items-center px-4 sm:px-6">
          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center">
              <li>
                <Link
                  href="/"
                  className="block px-4 py-4 text-[15px] font-semibold text-accent-soft"
                >
                  Home
                </Link>
              </li>
              {primary.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.slug}`}
                    className="block px-4 py-4 text-[15px] font-medium text-white/85 transition-colors hover:text-accent-soft"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="block px-4 py-4 text-[15px] font-medium text-white/85 transition-colors hover:text-accent-soft"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {rail.length > 0 && (
            <div className="ml-auto hidden items-center gap-1 border-l border-white/10 pl-5 xl:flex">
              {rail.map((s) => (
                <Link
                  key={s.id}
                  href={`/${s.slug}`}
                  className="px-3 py-4 text-[13.5px] text-white/60 transition-colors hover:text-white"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          )}

          <div className="flex w-full items-center justify-between py-3 lg:hidden">
            <span className="text-[13px] font-medium text-white/70">Sections</span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[13px] font-semibold text-accent-soft"
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            aria-label="Sections"
            className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-white"
          >
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <span className="text-[20px] font-extrabold text-ink">{siteName}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <span aria-hidden className="text-[18px]">✕</span>
              </button>
            </div>
            <ul className="px-5 py-2">
              {[{ id: 'home', title: 'Home', slug: '' }, ...sections].map((s) => (
                <li key={s.id} className="border-b border-rule last:border-0">
                  <Link
                    href={`/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="block py-3.5 text-[17px] font-semibold text-ink"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              <li className="border-t border-rule">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-[17px] font-semibold text-ink"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
