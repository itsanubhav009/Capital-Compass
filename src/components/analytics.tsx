'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const KEY = 'cc-consent'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

type Choice = 'granted' | 'denied' | null

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * The audience is largely NRI, which means readers in the EU and UK, which
 * means GDPR applies regardless of where the publication is based. So consent
 * defaults to denied and analytics cookies are only set after the reader
 * agrees. Consent Mode still sends cookieless pings when denied, so you keep
 * aggregate traffic counts without storing anything identifying.
 */
export function Analytics() {
  const [choice, setChoice] = useState<Choice>(null)

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    if (stored === 'granted' || stored === 'denied') setChoice(stored)
  }, [])

  useEffect(() => {
    if (!choice || typeof window.gtag !== 'function') return
    window.gtag('consent', 'update', {
      analytics_storage: choice,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }, [choice])

  if (!GA_ID) return null

  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="ga-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}

/**
 * Consent banner. Deliberately plain: a clear question, two equally weighted
 * buttons, and a link to the privacy page. Dark patterns that make refusal
 * harder than acceptance are non-compliant under GDPR, and this audience
 * notices.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!GA_ID) return
    const stored = localStorage.getItem(KEY)
    if (stored !== 'granted' && stored !== 'denied') {
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const decide = (value: 'granted' | 'denied') => {
    localStorage.setItem(KEY, value)
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: value,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-surface shadow-[0_-1px_12px_rgba(16,26,36,0.06)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          We use analytics to understand which articles people read. Nothing is shared with
          advertisers.{' '}
          <a href="/privacy" className="text-deep underline decoration-brass-soft underline-offset-4">
            How we handle your data
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="border border-rule-strong px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:border-deep"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="bg-deep px-4 py-2 text-[14px] font-medium text-paper transition-colors hover:bg-deep-soft"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
