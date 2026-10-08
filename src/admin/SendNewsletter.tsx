'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * "Email this to subscribers" — the control, and the record of every time it
 * was used on this article.
 *
 * It lives on the article form rather than on a page of its own because that
 * is where the decision is made: you publish a piece, and then you decide
 * whether it is worth an email. Making someone navigate elsewhere to send it,
 * and somewhere else again to find out whether it worked, is how sends get
 * forgotten and how failures go unnoticed.
 *
 * The log is phrased for a person who does not want to think about mail
 * servers: "reached" and "did not reach", with a plain reason beside each
 * address that did not.
 */

type Recipient = { email: string; status: 'delivered' | 'failed'; error?: string }
type SendLog = {
  id: string | number
  sentAt: string
  delivered: number
  failed: number
  total: number
  recipients: Recipient[]
}

const card: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '16px 18px',
  marginBottom: 22,
}

const when = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SendNewsletter() {
  const { id, savedDocumentData } = useDocumentInfo() as any

  const [subscribers, setSubscribers] = useState<number | null>(null)
  const [logs, setLogs] = useState<SendLog[]>([])
  const [open, setOpen] = useState<string | number | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)

  const published = savedDocumentData?._status === 'published'

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [subRes, logRes] = await Promise.all([
        fetch('/api/subscribers?limit=0&where[unsubscribedAt][equals]=null', {
          credentials: 'include',
        }),
        fetch(
          `/api/newsletter-sends?limit=20&sort=-sentAt&where[article][equals]=${id}`,
          { credentials: 'include' },
        ),
      ])
      const subJson = await subRes.json().catch(() => ({}))
      const logJson = await logRes.json().catch(() => ({}))
      if (typeof subJson?.totalDocs === 'number') setSubscribers(subJson.totalDocs)
      if (Array.isArray(logJson?.docs)) setLogs(logJson.docs)
    } catch {
      /* The panel is informational; a failed refresh should not shout. */
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const send = async () => {
    setConfirming(false)
    setState('sending')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articleId: id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setState('error')
        setMessage(json?.error || `That did not work (${res.status}).`)
        return
      }
      setState('done')
      setMessage(
        json.failed === 0
          ? `Sent. The mail server accepted all ${json.delivered}.`
          : `Accepted for ${json.delivered} of ${json.total}. ${json.failed} could not be sent — see below for which, and why.`,
      )
      load()
    } catch {
      setState('error')
      setMessage('Could not reach the server. Check your connection and try again.')
    }
  }

  // A brand new article has no id until it is first saved, and there is
  // nothing to send.
  if (!id) return null

  const tone =
    state === 'error' ? '#b4462f' : state === 'done' ? '#1d7a55' : 'var(--theme-elevation-600)'

  return (
    <div style={card}>
      <strong style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>
        Email this to subscribers
      </strong>

      {!published ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-600)' }}>
          Publish the article first. Sending it while it is a draft would send readers to a page
          that is not there.
        </p>
      ) : (
        <>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--theme-elevation-600)' }}>
            {subscribers === null
              ? 'Checking the list…'
              : subscribers === 0
                ? 'Nobody has subscribed yet, so there is nobody to send to.'
                : `Goes to ${subscribers} subscriber${subscribers === 1 ? '' : 's'}, one email each. Anyone who unsubscribed is skipped.`}
            {logs.length > 0 && ' This article has been sent before — see the record below.'}
          </p>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={state === 'sending' || !subscribers}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 4,
                border: 0,
                cursor: state === 'sending' || !subscribers ? 'default' : 'pointer',
                background: !subscribers ? 'var(--theme-elevation-200)' : '#0073ff',
                color: !subscribers ? 'var(--theme-elevation-500)' : '#fff',
              }}
            >
              {state === 'sending' ? 'Sending…' : 'Send to subscribers'}
            </button>
          ) : (
            <div
              style={{
                background: 'var(--theme-elevation-50)',
                borderRadius: 4,
                padding: '12px 14px',
              }}
            >
              <p style={{ margin: '0 0 10px', fontSize: 13 }}>
                This sends a real email to {subscribers} {subscribers === 1 ? 'person' : 'people'}{' '}
                straight away. It cannot be recalled.
              </p>
              <button
                type="button"
                onClick={send}
                style={{
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 4,
                  border: 0,
                  cursor: 'pointer',
                  background: '#b4462f',
                  color: '#fff',
                  marginRight: 8,
                }}
              >
                Yes, send it now
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{
                  padding: '7px 14px',
                  fontSize: 13,
                  borderRadius: 4,
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'transparent',
                  color: 'var(--theme-elevation-700)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {message && (
            <p role="status" style={{ margin: '12px 0 0', fontSize: 13, color: tone }}>
              {message}
            </p>
          )}
        </>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: 18, borderTop: '1px solid var(--theme-elevation-100)', paddingTop: 14 }}>
          <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            Previously sent
          </strong>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--theme-elevation-500)' }}>
            “Accepted” means the mail server took the message. A mailbox that rejects it
            afterwards bounces hours later, and that bounce cannot be shown here — addresses whose
            domain has no mail server at all are caught before sending and listed as not sent.
          </p>

          {logs.map((log) => {
            const isOpen = open === log.id
            return (
              <div key={log.id} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : log.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'var(--theme-elevation-50)',
                    border: 0,
                    borderRadius: 4,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--theme-elevation-800)',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{when(log.sentAt)}</span>
                  {' — '}
                  <span style={{ color: '#1d7a55' }}>{log.delivered} accepted</span>
                  {log.failed > 0 && (
                    <>
                      {', '}
                      <span style={{ color: '#b4462f' }}>{log.failed} not sent</span>
                    </>
                  )}
                  <span style={{ float: 'right', color: 'var(--theme-elevation-500)' }}>
                    {isOpen ? 'Hide' : 'Show each address'}
                  </span>
                </button>

                {isOpen && (
                  <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                    {(log.recipients ?? []).map((r, i) => (
                      <li
                        key={`${r.email}-${i}`}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'baseline',
                          padding: '6px 12px',
                          fontSize: 12.5,
                          borderBottom: '1px solid var(--theme-elevation-100)',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            color: r.status === 'delivered' ? '#1d7a55' : '#b4462f',
                            fontWeight: 700,
                          }}
                        >
                          {r.status === 'delivered' ? '✓' : '✕'}
                        </span>
                        <span style={{ flex: '1 1 auto', minWidth: 0, wordBreak: 'break-all' }}>
                          {r.email}
                        </span>
                        <span
                          style={{
                            color:
                              r.status === 'delivered' ? '#1d7a55' : 'var(--theme-elevation-600)',
                            textAlign: 'right',
                          }}
                        >
                          {r.status === 'delivered' ? 'Accepted' : r.error || 'Not sent'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
