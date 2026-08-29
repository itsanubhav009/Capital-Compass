import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
}

/**
 * Shown by the service worker when a navigation fails and nothing is cached.
 * Static by design — it must render with no network and no database.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <span className="eyebrow">No connection</span>
      <h1 className="mt-3 text-[32px]">You are offline.</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        Articles you have already opened are still readable. Everything else needs a
        connection.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block bg-deep px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-deep-soft"
      >
        Try again
      </Link>
    </div>
  )
}
