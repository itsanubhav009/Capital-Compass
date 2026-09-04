'use client'

import { useState } from 'react'

/**
 * "Add from URL" strip above the image list.
 *
 * Pasting a link was the missing half of image handling — the upload field
 * only takes a file, so anyone holding a URL had to download it first. This
 * hands the link to /api/media/from-url, which fetches and stores it through
 * the normal create so resizing and WebP conversion still happen.
 */
export default function AddImageFromUrl() {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async () => {
    if (!url.trim()) {
      setState('error')
      setMessage('Paste an image address first.')
      return
    }
    setState('working')
    setMessage('')
    try {
      const res = await fetch('/api/media/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: url.trim(), alt: alt.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setState('error')
        setMessage(json?.error || `That did not work (${res.status}).`)
        return
      }
      setState('done')
      setMessage(`Added ${json?.doc?.filename ?? 'the image'}. Reloading…`)
      setUrl('')
      setAlt('')
      setTimeout(() => window.location.reload(), 700)
    } catch {
      setState('error')
      setMessage('Could not reach the server. Check your connection.')
    }
  }

  const tone =
    state === 'error' ? '#b4462f' : state === 'done' ? '#1d7a55' : 'var(--theme-elevation-600)'

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        padding: '16px 18px',
        marginBottom: 24,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'grid', gap: 3 }}>
        <strong style={{ fontSize: 15 }}>Add from URL</strong>
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-600)' }}>
          Paste a direct link to an image file. It is downloaded, converted and resized here, so
          the site never hotlinks to someone else&rsquo;s server.
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (state !== 'idle') setState('idle')
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="https://example.com/photo.jpg"
          aria-label="Image address"
          style={{
            flex: '2 1 320px',
            minWidth: 0,
            padding: '8px 10px',
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
          }}
        />
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Alt text (optional)"
          aria-label="Alt text"
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            padding: '8px 10px',
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={state === 'working'}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 4,
            border: 0,
            cursor: state === 'working' ? 'default' : 'pointer',
            background: '#0073ff',
            color: '#fff',
            opacity: state === 'working' ? 0.6 : 1,
          }}
        >
          {state === 'working' ? 'Fetching…' : 'Add image'}
        </button>
      </div>

      {message && (
        <span role="status" style={{ fontSize: 13, color: tone }}>
          {message}
        </span>
      )}
    </div>
  )
}
