'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Re-renders the page when Payload reports a change.
 *
 * Live preview works by posting a message from the admin panel into the
 * preview iframe. Without something listening, the iframe shows whatever it
 * loaded first and never moves again — which is what "live preview does not
 * update" always turns out to be.
 *
 * `router.refresh()` re-runs the server components, so the draft is fetched
 * fresh rather than patched together on the client. Slower than a client-side
 * merge, but it cannot drift from what the page will actually render.
 */
export function PreviewBridge({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
