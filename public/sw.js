/* Capital Compass service worker.
 *
 * Deliberately conservative. A news site that serves stale articles is worse
 * than one that shows an offline notice, so HTML is network-first and only
 * falls back to cache when the network genuinely fails. Static assets, which
 * are content-hashed by Next, are cache-first.
 */

const VERSION = 'cc-v1'
const PAGES = `${VERSION}-pages`
const ASSETS = `${VERSION}-assets`
const OFFLINE = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll([OFFLINE])).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never cache the admin panel, the API, or anything authenticated.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/data')
  ) {
    return
  }

  // Static assets are content-hashed, so cache-first is safe.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(ASSETS).then((c) => c.put(request, copy))
            return res
          }),
      ),
    )
    return
  }

  // HTML: network first, cache as fallback, offline page as last resort.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(PAGES).then((c) => c.put(request, copy))
          return res
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match(OFFLINE)),
        ),
    )
  }
})
