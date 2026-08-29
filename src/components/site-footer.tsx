'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/* ------------------------------------------------ route progress bar --- */

/**
 * Thin bar across the top during navigation.
 *
 * Next's App Router gives no navigation-start event, so this watches for the
 * pathname changing and animates on either side of it. It is a perception
 * device rather than a real progress measure, which is what every
 * implementation of this pattern actually is.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setWidth(18)

    const a = setTimeout(() => setWidth(62), 90)
    const b = setTimeout(() => setWidth(88), 260)
    const c = setTimeout(() => setWidth(100), 420)
    const d = setTimeout(() => setVisible(false), 620)
    const e = setTimeout(() => setWidth(0), 780)

    return () => [a, b, c, d, e].forEach(clearTimeout)
  }, [pathname])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${width}%`,
          transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 0 10px rgba(27,110,243,0.6)',
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------- scroll to top --- */

export function ScrollTop() {
  const [show, setShow] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      setShow(y > 600)
      setPct(max > 0 ? Math.min(100, (y / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r = 20
  const circumference = 2 * Math.PI * r

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-lg transition-all duration-300 hover:bg-accent-soft ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {/* Ring fills as the reader moves down the page. */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/* ------------------------------------------------------------ footer --- */

const SOCIAL = [
  { label: 'Facebook', href: '#', d: 'M13 10h3l.5-3H13V5.5c0-.9.3-1.5 1.6-1.5H16.6V1.3C16.3 1.2 15.2 1 14 1c-2.5 0-4 1.5-4 4.3V7H7v3h3v8h3v-8z' },
  { label: 'Instagram', href: '#', d: 'M10 2.7c2.4 0 2.7 0 3.6.05.9.04 1.4.2 1.7.32.43.17.74.37 1.06.7.32.31.52.62.69 1.05.12.31.28.8.32 1.7.04.9.05 1.2.05 3.5s0 2.6-.05 3.5c-.04.9-.2 1.4-.32 1.7-.17.43-.37.74-.7 1.06-.31.32-.62.52-1.05.69-.31.12-.8.28-1.7.32-.9.04-1.2.05-3.6.05s-2.7 0-3.6-.05c-.9-.04-1.4-.2-1.7-.32a2.9 2.9 0 01-1.06-.7 2.9 2.9 0 01-.69-1.05c-.12-.31-.28-.8-.32-1.7C2.7 12.6 2.7 12.3 2.7 10s0-2.6.05-3.5c.04-.9.2-1.4.32-1.7.17-.43.37-.74.7-1.06.31-.32.62-.52 1.05-.69.31-.12.8-.28 1.7-.32.9-.04 1.2-.05 3.5-.05zM10 6.3a3.7 3.7 0 100 7.4 3.7 3.7 0 000-7.4zm0 6.1a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8zm4.7-6.2a.86.86 0 11-1.7 0 .86.86 0 011.7 0z' },
  { label: 'LinkedIn', href: '#', d: 'M5.4 17H2.6V7.8h2.8V17zM4 6.6a1.6 1.6 0 110-3.3 1.6 1.6 0 010 3.3zM17.4 17h-2.8v-4.5c0-1.07-.02-2.44-1.5-2.44-1.5 0-1.73 1.16-1.73 2.36V17H8.6V7.8h2.68v1.26h.04c.37-.7 1.28-1.45 2.64-1.45 2.82 0 3.44 1.86 3.44 4.28V17z' },
  { label: 'X', href: '#', d: 'M14.9 2h2.6l-5.7 6.5L18.5 18h-5.2l-4.1-5.4L4.5 18H1.9l6.1-7L1.5 2h5.3l3.7 4.9L14.9 2zm-.9 14.4h1.4L6.1 3.5H4.6l9.4 12.9z' },
]

type Recent = { slug: string; title: string; image?: string | null; views?: number | null }

function FooterHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative pb-4 text-[21px] font-bold text-white">
      {children}
      <span aria-hidden className="absolute bottom-0 left-0 h-[3px] w-14 bg-accent" />
    </h2>
  )
}

export function SiteFooter({
  siteName,
  legalName,
  disclaimer,
  blurb,
  sections,
  recent = [],
  tags = [],
}: {
  siteName: string
  legalName: string
  disclaimer: string
  blurb?: string
  sections: { id: any; title: string; slug: string }[]
  recent?: Recent[]
  tags?: string[]
}) {
  return (
    <footer className="mt-16 bg-bar text-white">
      <div className="mx-auto max-w-[1430px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.8fr_1.3fr_1fr]">
          {/* -------------------------------------------------- brand --- */}
          <div>
            <span className="text-[26px] font-extrabold tracking-tight">{siteName}</span>
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-white/60">
              {blurb ??
                'We track where large investors actually put their money, and explain why in plain English. No tips, no target prices.'}
            </p>
            <div className="mt-7 flex gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center border border-white/15 text-white/70 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------- sections --- */}
          <div>
            <FooterHead>Sections</FooterHead>
            <ul className="mt-6 space-y-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.slug}`}
                    className="group flex items-center gap-2.5 text-[14.5px] text-white/65 transition-colors hover:text-white"
                  >
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-150" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ------------------------------------------------- recent --- */}
          <div>
            <FooterHead>Recent</FooterHead>
            <ul className="mt-6 divide-y divide-white/10">
              {recent.slice(0, 3).map((r) => (
                <li key={r.slug} className="py-4 first:pt-0">
                  <Link href={`/insight/${r.slug}`} className="group flex gap-4">
                    <span className="relative block h-16 w-20 shrink-0 overflow-hidden bg-white/5">
                      {r.image && <Image src={r.image} alt="" fill sizes="80px" className="object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-white/90 transition-colors group-hover:text-accent-soft">
                        {r.title}
                      </span>
                      {typeof r.views === 'number' && (
                        <span className="tnum mt-1.5 block text-[12px] text-white/45">{r.views} views</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------------------------------- tags --- */}
          <div>
            <FooterHead>Topics</FooterHead>
            <div className="mt-6 flex flex-wrap gap-2">
              {(tags.length ? tags : ['FII flows', 'DII', 'Promoters', 'Macro', 'Defence', 'AI', 'Renewables', 'NRI']).map(
                (t) => (
                  <span
                    key={t}
                    className="border border-white/15 px-3 py-1.5 text-[13px] text-white/65 transition-colors hover:border-accent hover:text-white"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- disclaimer --- */}
        <p className="mt-14 border-t border-white/10 pt-8 text-[12.5px] leading-relaxed text-white/45">
          {disclaimer}
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1430px] flex-col gap-3 px-4 py-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {legalName}. All rights reserved.</p>
          <nav className="flex gap-6">
            {[
              ['Privacy', '/privacy'],
              ['Terms', '/terms'],
              ['Disclaimer', '/disclaimer'],
              ['Editorial standards', '/editorial-standards'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
