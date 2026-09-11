'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * The disclaimer a reader has to accept before going any further.
 *
 * Bumping the version invalidates every stored acceptance, which is what you
 * want the day the legal copy changes — an acceptance of last year's wording
 * is not an acceptance of this year's.
 */
export const DISCLAIMER_KEY = 'cc-disclaimer-accepted'
export const DISCLAIMER_VERSION = '1'

/** Event any component can fire to show the disclaimer again. */
export const OPEN_DISCLAIMER = 'cc-open-disclaimer'
/** Fired once the reader accepts, so other banners can wait their turn. */
export const DISCLAIMER_ACCEPTED = 'cc-disclaimer-accepted-event'

export function hasAcceptedDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === DISCLAIMER_VERSION
  } catch {
    // Private mode, or storage disabled. Treat as not accepted: showing the
    // notice twice is a nuisance, never showing it is a legal problem.
    return false
  }
}

/**
 * Blocking disclaimer notice.
 *
 * Two modes, one component:
 *
 *  - First visit: the reader cannot dismiss it. There is no close button, the
 *    backdrop does not respond to clicks, Escape does nothing and the page
 *    behind it does not scroll. The single way out is the accept button.
 *  - Afterwards: anything can fire `cc-open-disclaimer` to reopen it for
 *    reference, and in that mode it closes normally.
 */
export function DisclaimerGate({
  siteName,
  disclaimer,
}: {
  siteName: string
  disclaimer: string
}) {
  // 'unknown' while we have not yet read storage. Rendering nothing until
  // then keeps the server markup and the first client render identical.
  const [open, setOpen] = useState<'unknown' | 'closed' | 'required' | 'review'>('unknown')

  useEffect(() => {
    setOpen(hasAcceptedDisclaimer() ? 'closed' : 'required')

    const onOpen = () => setOpen('review')
    window.addEventListener(OPEN_DISCLAIMER, onOpen)
    return () => window.removeEventListener(OPEN_DISCLAIMER, onOpen)
  }, [])

  useEffect(() => {
    if (open !== 'required' && open !== 'review') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (open === 'unknown' || open === 'closed') return null

  const required = open === 'required'

  const accept = () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, DISCLAIMER_VERSION)
    } catch {
      // Nothing to do. The reader has accepted for this page view; a browser
      // that refuses storage will simply ask again next time.
    }
    window.dispatchEvent(new Event(DISCLAIMER_ACCEPTED))
    setOpen('closed')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[10px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[10px]">
        <div className="border-b border-rule px-6 py-5 sm:px-8">
          <span className="kicker">{siteName}</span>
          <h2 id="disclaimer-title" className="mt-2 text-[24px] sm:text-[28px]">
            Legal disclaimer
          </h2>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="text-[15px] leading-relaxed text-ink-soft">{disclaimer}</p>

          <ul className="mt-5 space-y-2.5 border-t border-rule pt-5 text-[14.5px] leading-relaxed text-ink-soft">
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Everything published here is journalism and general information. It is not
              investment advice and not a recommendation to buy or sell anything.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              Flow indicators describe activity that has already been observed. They are not
              ratings, scores or forecasts.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              You are responsible for your own decisions. Speak to a registered adviser before
              acting on anything you read.
            </li>
          </ul>

          <p className="mt-5 text-[13px] text-ink-faint">
            The full wording is on the{' '}
            <Link
              href="/disclaimer"
              className="text-accent underline underline-offset-4"
              onClick={() => !required && setOpen('closed')}
            >
              disclaimer page
            </Link>
            , alongside our{' '}
            <Link
              href="/terms"
              className="text-accent underline underline-offset-4"
              onClick={() => !required && setOpen('closed')}
            >
              terms
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-accent underline underline-offset-4"
              onClick={() => !required && setOpen('closed')}
            >
              privacy notice
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-rule bg-sunken px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-[13px] text-ink-faint">
            {required
              ? 'Please accept to continue to the site.'
              : 'You accepted this notice earlier.'}
          </p>
          <div className="flex shrink-0 gap-3">
            {!required && (
              <button
                type="button"
                onClick={() => setOpen('closed')}
                className="rounded-[6px] border border-rule-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:border-ink"
              >
                Close
              </button>
            )}
            <button
              type="button"
              onClick={accept}
              className="rounded-[6px] bg-accent px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-soft"
            >
              {required ? 'I understand and accept' : 'Accept again'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Footer link that brings the notice back up. */
export function ReviewDisclaimerButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_DISCLAIMER))}
      className={className}
    >
      Review the disclaimer
    </button>
  )
}
