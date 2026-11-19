'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Sends one view per page to /api/view. Renders nothing.
 *
 * The visitor ID is a random UUID kept in localStorage; the server keeps the
 * same ID in a cookie it sets itself, and hands back whichever survived, so
 * a reader who loses one copy is restored from the other rather than counted
 * twice. The ID carries nothing about the reader and is used only to count.
 *
 * Every read and write is wrapped: private windows and blocked storage throw,
 * and counting must never break the page.
 */

const KEY = 'smx_vid'

function storedId(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function keep(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* storage blocked: the server's cookie still carries it */
  }
}

export function VisitorTracker() {
  const pathname = usePathname()
  // React runs effects twice in development, and the router can settle on a
  // path more than once; one view per path per page visit is what counts.
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || last.current === pathname) return
    last.current = pathname

    let id = storedId()
    if (!id) {
      id = crypto.randomUUID()
      keep(id)
    }

    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: id, path: pathname, referrer: document.referrer || null }),
      keepalive: true,
      credentials: 'same-origin',
    })
      .then((r) => r.json())
      .then((j) => {
        if (j?.vid && j.vid !== id) keep(j.vid)
      })
      .catch(() => {})
  }, [pathname])

  return null
}
