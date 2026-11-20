'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Sends one view per page to /api/view. Renders nothing.
 *
 * The visitor ID is a random UUID the server issues, kept here in
 * localStorage and by the server in a cookie, so a reader who loses one copy
 * is restored from the other rather than counted twice. It carries nothing
 * about the reader and is used only to count.
 *
 * A visitor with no ID at all may be asked by the server to identify the
 * device with Fingerprint (lib/fingerprint.ts) — only when it is set up, the
 * month's calls are not used up, and, unless the owner has turned that off,
 * the reader has accepted analytics. If the reader has not, or the script is
 * blocked, the page says so and the server counts them by a new cookie ID.
 *
 * Every storage access is wrapped: private windows and blocked storage throw,
 * and counting must never break the page.
 */

const KEY = 'smx_vid'
const CONSENT = 'cc-consent'

const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}

const keep = (id: string) => {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* storage blocked: the server's cookie still carries it */
  }
}

type Need = { publicKey: string; region: 'us' | 'eu' | 'ap'; requireConsent: boolean }

const post = (payload: object) =>
  fetch('/api/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: 'same-origin',
  })
    .then((r) => r.json())
    .catch(() => null)

/** Fingerprint's browser agent, loaded only when a check is actually needed. */
async function identify(need: Need): Promise<{ visitorId: string; requestId: string }> {
  const url = `https://fpjscdn.net/v3/${need.publicKey}`
  const agent: any = await import(/* webpackIgnore: true */ url)
  const fp = await agent.load(need.region === 'us' ? {} : { region: need.region })
  const result: any = await Promise.race([
    fp.get(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
  ])
  return { visitorId: result.visitorId, requestId: result.requestId }
}

export function VisitorTracker() {
  const pathname = usePathname()
  // React runs effects twice in development, and the router can settle on a
  // path more than once; one view per path per page visit is what counts.
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || last.current === pathname) return
    last.current = pathname

    const base = { path: pathname, referrer: document.referrer || null }
    ;(async () => {
      let res: any = await post({ ...base, vid: read(KEY) })

      if (res?.needFingerprint) {
        const need: Need = res.needFingerprint
        if (need.requireConsent && read(CONSENT) !== 'granted') {
          res = await post({ ...base, fpFallback: 'no-consent' })
        } else {
          try {
            res = await post({ ...base, fp: await identify(need) })
          } catch {
            // Blocked by an ad blocker, offline, or too slow: still counted.
            res = await post({ ...base, fpFallback: 'blocked' })
          }
        }
      }

      if (res?.vid) keep(res.vid)
    })()
  }, [pathname])

  return null
}
