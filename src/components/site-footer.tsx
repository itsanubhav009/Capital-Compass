'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ReviewDisclaimerButton } from '@/components/legal-gate'

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

type Recent = { slug: string; title: string; image?: string | null }

function FooterHead({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h5 className="text-[20px] text-white">{children}</h5>
      {/* .rs-divider.dot-enable — a short bar with a detached dot after it. */}
      <span aria-hidden className="mt-3 flex items-center gap-1.5">
        <span className="block h-[3px] w-[70px] bg-accent" />
        <span className="block h-[3px] w-[6px] bg-accent" />
      </span>
    </>
  )
}

export function SiteFooter({
  siteName,
  legalName,
  disclaimer,
  blurb,
  sections,
  recent = [],
}: {
  siteName: string
  legalName: string
  disclaimer: string
  blurb?: string
  sections: { id: any; title: string; slug: string }[]
  recent?: Recent[]
}) {
  return (
    <footer className="bg-bar text-white">
      <div className="mx-auto max-w-[1430px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.8fr_1.3fr_1fr]">
          {/* -------------------------------------------------- brand --- */}
          <div>
            <span className="text-[26px] font-extrabold tracking-tight">{siteName}</span>
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-white/60">
              {blurb ??
                'We track where large investors actually put their money, and explain why in plain English. No tips, no target prices.'}
            </p>
            {/* Social accounts removed — the contact page is the one route
                for questions, so there is nothing to point at yet. */}
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[14px] text-white/80 transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              Get in touch
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
            </Link>
          </div>

          {/* ----------------------------------------------- sections --- */}
          <div>
            <FooterHead>Top Categories</FooterHead>
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
            <FooterHead>Recent Post</FooterHead>
            <ul className="mt-6 divide-y divide-white/10">
              {recent.slice(0, 3).map((r) => (
                <li key={r.slug} className="py-4 first:pt-0">
                  <Link href={`/insight/${r.slug}`} className="group flex gap-4">
                    {/* An article with no image left a dark rectangle with
                        nothing in it, which reads as a picture that failed to
                        load. A mark makes it plainly deliberate. */}
                    <span className="relative grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-white/5">
                      {r.image ? (
                        <Image src={r.image} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden
                          className="text-white/20"
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <circle cx="8.5" cy="10" r="1.5" />
                          <path d="M21 15l-5-5L5 19" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-white/90 transition-colors group-hover:text-accent-soft">
                        {r.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ------------------------------------------------ follow us --- */}
          <div>
            <FooterHead>Follow Us</FooterHead>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href="https://x.com"
                aria-label="Follow us on X"
                className="grid h-11 w-11 place-items-center rounded-[6px] border border-white/15 text-white/75 transition-colors hover:border-accent hover:bg-accent hover:text-white"
              >
                <svg viewBox="0 0 512 512" width="17" height="17" fill="currentColor" aria-hidden>
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>
            </div>
            <p className="mt-4 max-w-[26ch] text-[13px] leading-relaxed text-white/45">
              More channels to come. For anything else, the{' '}
              <Link href="/contact" className="underline underline-offset-4 hover:text-white">
                contact page
              </Link>{' '}
              reaches us directly.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------- disclaimer ---
            The same notice the site gates on, repeated here so it is always
            one scroll away rather than something the reader clicked past
            once and can never find again. */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Legal disclaimer
          </h2>
          <p className="mt-3 max-w-5xl text-[12.5px] leading-relaxed text-white/45">
            {disclaimer}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px]">
            <Link href="/disclaimer" className="text-white/70 underline underline-offset-4 hover:text-white">
              Read the full disclaimer
            </Link>
            <ReviewDisclaimerButton className="text-white/70 underline underline-offset-4 transition-colors hover:text-white" />
          </div>
        </div>
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
