'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

/* ------------------------------------------------------------------ header */

export function SiteHeader({
  siteName,
  sections,
}: {
  siteName: string
  sections: { id: any; title: string; slug: string }[]
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-[19px] font-medium tracking-tight text-deep">
            {siteName}
          </span>
          <span
            aria-hidden
            className="hidden h-[9px] w-[9px] border border-brass transition-colors group-hover:bg-brass sm:block"
          />
        </Link>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/${s.slug}`}
                  className="text-[14px] text-ink-soft transition-colors hover:text-deep"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#newsletter"
            className="hidden bg-deep px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-deep-soft sm:block"
          >
            Get the weekly report
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="p-1.5 lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden className="block space-y-[5px]">
              <span
                className={`block h-px w-6 bg-ink transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`}
              />
              <span className={`block h-px w-6 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span
                className={`block h-px w-6 bg-ink transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-rule bg-paper lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {sections.map((s) => (
              <li key={s.id} className="border-b border-rule last:border-0">
                <Link
                  href={`/${s.slug}`}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 font-display text-[19px] text-ink"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

/* -------------------------------------------------------------------- cards */

const ACCENT: Record<string, string> = {
  deep: 'text-deep',
  brass: 'text-brass',
  inflow: 'text-inflow',
  outflow: 'text-outflow',
  ink: 'text-ink',
}

export function InsightCard({
  href,
  kind,
  title,
  standfirst,
  date,
  minutes,
  image,
  accent = 'deep',
  size = 'default',
}: {
  href: string
  kind: string
  title: string
  standfirst?: string | null
  date?: string
  minutes?: number | null
  image?: { url: string; alt: string } | null
  accent?: string
  size?: 'default' | 'lead'
}) {
  const lead = size === 'lead'
  return (
    <article className="group">
      <Link href={href} className="block">
        {image && (
          <div
            className={`relative mb-4 w-full overflow-hidden bg-sunken ${lead ? 'aspect-16/9' : 'aspect-3/2'}`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes={lead ? '(max-width: 1024px) 100vw, 760px' : '(max-width: 640px) 100vw, 380px'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority={lead}
            />
          </div>
        )}

        <span className={`eyebrow ${ACCENT[accent] ?? ACCENT.deep}`}>{kind}</span>

        <h3
          className={`mt-2 text-ink underline-offset-4 group-hover:underline group-hover:decoration-brass-soft ${
            lead ? 'text-[30px] sm:text-[38px]' : 'text-[21px]'
          }`}
        >
          {title}
        </h3>

        {standfirst && (
          <p
            className={`mt-2 text-ink-soft ${lead ? 'text-[17px]' : 'line-clamp-2 text-[15px]'}`}
          >
            {standfirst}
          </p>
        )}

        <p className="tnum mt-3 text-[11px] uppercase tracking-wider text-ink-faint">
          {date}
          {minutes ? ` · ${minutes} min read` : ''}
        </p>
      </Link>
    </article>
  )
}

/* --------------------------------------------------------------- newsletter */

export function NewsletterForm({
  heading,
  body,
  cta,
  finePrint,
  variant = 'block',
}: {
  heading: string
  body?: string
  cta: string
  finePrint?: string
  variant?: 'block' | 'inline' | 'footer'
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async () => {
    if (!email.includes('@')) {
      setState('error')
      setMessage('That email address is missing an @. Check it and try again.')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: variant }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Subscription failed')
      setState('done')
      setMessage('Subscribed. The next report lands Sunday.')
    } catch (e: any) {
      setState('error')
      setMessage(e.message || 'That did not go through. Try again in a moment.')
    }
  }

  const dark = variant === 'block'

  return (
    <div id="newsletter" className={dark ? 'bg-deep px-6 py-10 text-paper sm:px-10 sm:py-12' : ''}>
      <div className={dark ? 'mx-auto max-w-2xl text-center' : ''}>
        <span className={`eyebrow ${dark ? '!text-brass-soft' : ''}`}>Weekly</span>
        <h2
          className={`mt-2 ${dark ? 'text-[28px] sm:text-[34px]' : 'text-[22px]'} ${dark ? 'text-paper' : 'text-ink'}`}
        >
          {heading}
        </h2>
        {body && (
          <p className={`mt-3 text-[15px] ${dark ? 'text-paper/75' : 'text-ink-soft'}`}>{body}</p>
        )}

        {state === 'done' ? (
          <p
            className={`mt-6 text-[15px] font-medium ${dark ? 'text-brass-soft' : 'text-inflow'}`}
            role="status"
          >
            {message}
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-0">
            <label htmlFor={`nl-${variant}`} className="sr-only">
              Email address
            </label>
            <input
              id={`nl-${variant}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === 'error') setState('idle')
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="you@example.com"
              className={`w-full border px-4 py-3 text-[15px] outline-none ${
                dark
                  ? 'border-paper/25 bg-transparent text-paper placeholder:text-paper/40 focus:border-brass-soft'
                  : 'border-rule-strong bg-surface text-ink placeholder:text-ink-faint focus:border-deep'
              }`}
            />
            <button
              type="button"
              onClick={submit}
              disabled={state === 'sending'}
              className={`shrink-0 px-6 py-3 text-[15px] font-medium transition-colors disabled:opacity-60 ${
                dark ? 'bg-brass text-ink hover:bg-brass-soft' : 'bg-deep text-paper hover:bg-deep-soft'
              }`}
            >
              {state === 'sending' ? 'Sending…' : cta}
            </button>
          </div>
        )}

        {state === 'error' && (
          <p className="mt-2 text-[13px] text-outflow" role="alert">
            {message}
          </p>
        )}

        {finePrint && state !== 'done' && (
          <p className={`mt-3 text-[12px] ${dark ? 'text-paper/50' : 'text-ink-faint'}`}>
            {finePrint}
          </p>
        )}
      </div>
    </div>
  )
}

/** Fires once per session when the pointer leaves through the top of the window. */
export function ExitIntent({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('cc-exit-shown')) return
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true)
        sessionStorage.setItem('cc-exit-shown', '1')
        document.removeEventListener('mouseout', onLeave)
      }
    }
    const t = setTimeout(() => document.addEventListener('mouseout', onLeave), 12000)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
      onClick={() => setShow(false)}
    >
      <div
        className="relative w-full max-w-lg bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShow(false)}
          className="absolute right-3 top-3 z-10 p-2 text-paper/70 hover:text-paper"
        >
          <span className="sr-only">Close</span>
          <span aria-hidden>✕</span>
        </button>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------ AI search (Phase 2) */

/**
 * Reserved slot from Section 4 of the brief. Styled, present, and honest about
 * not being live yet — a fake search box that silently does nothing is worse
 * than no search box.
 */
export function AiSearchSlot() {
  return (
    <div className="border border-dashed border-rule-strong bg-sunken/60 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="tnum text-[15px] text-ink-faint">
            ⌕
          </span>
          <span className="text-[15px] text-ink-faint">
            Ask a question about any company, sector or flow
          </span>
        </div>
        <span className="eyebrow shrink-0">Coming in Phase 2</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ footer */

export function SiteFooter({
  siteName,
  legalName,
  disclaimer,
  sections,
  newsletter,
}: {
  siteName: string
  legalName: string
  disclaimer: string
  sections: { id: any; title: string; slug: string }[]
  newsletter: React.ReactNode
}) {
  return (
    <footer className="mt-20 border-t border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <span className="font-display text-[21px] text-deep">{siteName}</span>
            <div className="mt-5 max-w-md">{newsletter}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="eyebrow">Sections</h2>
              <ul className="mt-3 space-y-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <Link href={`/${s.slug}`} className="text-[14px] text-ink-soft hover:text-deep">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow">About</h2>
              <ul className="mt-3 space-y-2">
                {[
                  ['About us', '/about'],
                  ['Contact', '/contact'],
                  ['Editorial standards', '/editorial-standards'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[14px] text-ink-soft hover:text-deep">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow">Legal</h2>
              <ul className="mt-3 space-y-2">
                {[
                  ['Disclaimer', '/disclaimer'],
                  ['Privacy', '/privacy'],
                  ['Terms', '/terms'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[14px] text-ink-soft hover:text-deep">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-rule pt-6">
          <p className="max-w-4xl text-[12px] leading-relaxed text-ink-faint">{disclaimer}</p>
          <p className="tnum mt-4 text-[11px] uppercase tracking-wider text-ink-faint">
            © {new Date().getFullYear()} {legalName}
          </p>
        </div>
      </div>
    </footer>
  )
}
