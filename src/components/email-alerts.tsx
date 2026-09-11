'use client'

import { useEffect, useState } from 'react'
import { NewsletterForm } from '@/components/site'

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2-1 4.4-1.6 5 -.4.4-.1 1.1.5 1.1h11.2c.6 0 .9-.7.5-1.1 -.6-.6-1.6-1.8-1.6-5A4.5 4.5 0 0 0 10 2.5Z"
        strokeLinejoin="round"
      />
      <path d="M8 15.5a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  )
}

/**
 * "Subscribe for email alerts" — the top banner's right-hand corner.
 *
 * The signup itself is the same form used everywhere else, disclaimer
 * acceptance included, so there is one code path for storing an address and
 * one wording for what the reader is agreeing to.
 */
export function EmailAlertsButton({
  heading = 'Email alerts on smart money',
  body = 'New institutional activity, macro shifts and sector themes — sent as they are published.',
  cta = 'Subscribe',
  finePrint,
  className = '',
}: {
  heading?: string
  body?: string
  cta?: string
  finePrint?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-[100px] shrink-0 flex-col justify-center gap-1 rounded-[10px] bg-bar px-5 text-left text-white transition-colors hover:bg-bar-2 ${className}`}
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dot">
          <BellIcon />
          Email alerts
        </span>
        <span className="text-[15px] font-bold leading-snug">
          Subscribe for alerts on
          <br className="hidden xl:block" /> new smart money information
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Subscribe for email alerts"
          className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[10px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-[6px] text-ink-faint transition-colors hover:bg-sunken hover:text-ink"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                <path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z" />
              </svg>
            </button>

            <NewsletterForm
              heading={heading}
              body={body}
              cta={cta}
              finePrint={finePrint}
              eyebrow="Email alerts"
              variant="inline"
            />
          </div>
        </div>
      )}
    </>
  )
}
