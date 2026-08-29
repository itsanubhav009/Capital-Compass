'use client'

import { useEffect, useState } from 'react'

const DISMISSED = 'cc-install-dismissed'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Registers the service worker. Renders nothing.
 *
 * Registration waits for the load event so it never competes with the initial
 * render for bandwidth — the brief's 85+ mobile target is easy to lose to a
 * worker fetching its cache during first paint.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.error('[sw] registration failed', err))
    }

    if (document.readyState === 'complete') register()
    else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}

/**
 * Install prompt.
 *
 * Deliberately restrained: appears once, after the reader has spent a minute
 * on the site, and stays dismissed. An immediate install banner on a first
 * visit is the single most disliked pattern in mobile publishing, and this
 * audience will simply leave.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED)) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
      setTimeout(() => setVisible(true), 60_000)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!event) return
    await event.prompt()
    await event.userChoice
    localStorage.setItem(DISMISSED, '1')
    setVisible(false)
  }

  if (!visible || !event) return null

  return (
    <div
      role="dialog"
      aria-label="Install Capital Compass"
      className="fixed inset-x-3 bottom-3 z-50 border border-rule bg-surface p-4 shadow-[0_2px_16px_rgba(16,26,36,0.10)] sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icons/icon-192.png"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="font-display text-[17px] leading-snug text-ink">
            Add Capital Compass to your home screen
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            Opens like an app, and recent articles stay readable without a connection.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="flex-1 border border-rule-strong px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:border-deep"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={install}
          className="flex-1 bg-deep px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-deep-soft"
        >
          Add
        </button>
      </div>
    </div>
  )
}
