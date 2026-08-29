'use client'

import { useEffect } from 'react'

/**
 * Fires one view increment per article per session. Renders nothing.
 *
 * sessionStorage rather than localStorage so a returning reader counts again
 * on a new visit, which is roughly what a reader expects "views" to mean.
 */
export function ViewCounter({ collection, slug }: { collection: string; slug: string }) {
  useEffect(() => {
    const key = `cc-viewed-${slug}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    const t = setTimeout(() => {
      fetch('/api/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, slug }),
        keepalive: true,
      }).catch(() => {})
    }, 4000) // only count a read, not a bounce

    return () => clearTimeout(t)
  }, [collection, slug])

  return null
}
