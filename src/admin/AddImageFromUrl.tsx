'use client'

import { useState } from 'react'

/**
 * "Add from URL" — pasting a link instead of uploading a file.
 *
 * Payload's upload field only takes a file, so anyone holding a URL had to
 * download it first. This hands the link to /api/media/from-url, which fetches
 * and stores it through the normal create so resizing and WebP conversion
 * still happen and the site never hotlinks someone else's server.
 *
 * It sits on the article form, under Main image. It used to sit above the
 * Images list, but that list came off the sidebar and took the only route to
 * this control with it. Here it is next to the field it feeds.
 *
 * Deliberately does not reload: on an article form that would throw away
 * unsaved edits. It reports the name instead and points at the picker.
 */
export default function AddImageFromUrl() {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

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
      setMessage(
        `Added “${json?.doc?.filename ?? 'the image'}” to the library. Open Choose from existing above to attach it — it is the newest one.`,
      )
      setUrl('')
      setAlt('')
    } catch {
      setState('error')
      setMessage('Could not reach the server. Check your connection.')
    }
  }

  const tone =
    state === 'error' ? '#b4462f' : state === 'done' ? '#1d7a55' : 'var(--theme-elevation-600)'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          marginTop: -8,
          marginBottom: 18,
          font: 'inherit',
          fontSize: 13,
          color: 'var(--theme-elevation-700)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >
        Or add an image from a URL
      </button>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        padding: '14px 16px',
        marginTop: -4,
        marginBottom: 20,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <strong style={{ fontSize: 14 }}>Add an image from a URL</strong>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 0,
            padding: 0,
            font: 'inherit',
            fontSize: 13,
            color: 'var(--theme-elevation-600)',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
      <span style={{ fontSize: 12.5, color: 'var(--theme-elevation-600)' }}>
        A direct link to an image file. It is downloaded and resized here, then added to the
        library for you to pick above.
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (state !== 'idle') setState('idle')
          }}
          placeholder="https://example.com/photo.jpg"
          aria-label="Image address"
          style={{
            flex: '2 1 280px',
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
          placeholder="Alt text (optional)"
          aria-label="Alt text"
          style={{
            flex: '1 1 170px',
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
