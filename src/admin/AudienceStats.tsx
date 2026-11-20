'use client'

import { useEffect, useState } from 'react'

/**
 * Unique visitors, at the top of the admin dashboard.
 *
 * A visitor is a browser on a device, counted once however often it comes
 * back. The panel says so, because "unique people" is what everyone will
 * assume and a reader on phone and laptop is two of these.
 */

type Stats = {
  totals: {
    all_time: number
    new_today: number
    new_30d: number
    unique_today: number
    unique_7d: number
    unique_30d: number
    views_30d: number
    counting_since: string | null
  }
  daily: { day: string; visitors: number; views: number }[]
  articles: { slug: string; title: string | null; readers: number }[]
  sources: { source: string; visitors: number }[]
  fingerprint: { used: number; limit: number; requireConsent: boolean } | null
}

/** What each way of knowing a visitor means, for someone reading the panel. */
const SOURCE: Record<string, string> = {
  cookie: 'Our ID (cookie)',
  fingerprint: 'Identified by Fingerprint',
  'fingerprint-match': 'Returning, recognised by Fingerprint (not counted again)',
  'no-consent': 'No consent: new cookie ID',
  blocked: 'Fingerprint blocked: new cookie ID',
  'over-limit': 'Over the monthly limit: new cookie ID',
  unverified: 'Fingerprint not verified: new cookie ID',
}

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '18px 20px',
  marginBottom: 28,
}

const n = (v: number) => v.toLocaleString('en-IN')

export default function AudienceStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stats/audience', { credentials: 'include' })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.error || `Could not load (${r.status})`)
        setStats(j)
      })
      .catch((e) => setError(String(e.message || e)))
  }, [])

  if (error) {
    return (
      <div style={box}>
        <strong style={{ fontSize: 14 }}>Audience</strong>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--theme-elevation-600)' }}>{error}</p>
      </div>
    )
  }
  if (!stats) {
    return (
      <div style={box}>
        <strong style={{ fontSize: 14 }}>Audience</strong>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--theme-elevation-500)' }}>Loading…</p>
      </div>
    )
  }

  const t = stats.totals
  const tiles: [string, number, string][] = [
    ['Unique visitors, 30 days', t.unique_30d, `${n(t.views_30d)} page views`],
    ['Unique visitors, 7 days', t.unique_7d, ''],
    ['Unique visitors today', t.unique_today, `${n(t.new_today)} new`],
    ['All visitors, ever', t.all_time, `${n(t.new_30d)} new in 30 days`],
  ]
  const max = Math.max(1, ...stats.daily.map((d) => d.visitors))
  const since = t.counting_since
    ? new Date(t.counting_since).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <strong style={{ fontSize: 15 }}>Audience</strong>
        <span style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>
          {since ? `Counting since ${since}. ` : ''}A visitor is one browser on one device, counted once.
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          margin: '14px 0 18px',
        }}
      >
        {tiles.map(([label, value, sub]) => (
          <div key={label} style={{ background: 'var(--theme-elevation-50)', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--theme-elevation-600)' }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>{n(value)}</div>
            {sub && <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {stats.daily.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-600)', marginBottom: 8 }}>
            Unique visitors per day, last 14 days
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {stats.daily.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${d.visitors} visitors, ${d.views} views`}
                style={{
                  flex: 1,
                  minWidth: 6,
                  height: `${Math.max(4, (d.visitors / max) * 100)}%`,
                  background: '#0073ff',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-600)', marginBottom: 6 }}>
            How visitors were identified, 30 days
          </div>
          {stats.sources.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-500)' }}>None yet.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
              {stats.sources.map((s) => (
                <li key={s.source} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{SOURCE[s.source] ?? s.source}</span>
                  <span style={{ color: 'var(--theme-elevation-600)' }}>{n(s.visitors)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-600)', marginBottom: 6 }}>
            Fingerprint, this month
          </div>
          {!stats.fingerprint ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-500)' }}>
              Not set up. Visitors are counted by our own ID alone.
            </p>
          ) : (
            <>
              <div style={{ fontSize: 13 }}>
                {n(stats.fingerprint.used)} of {n(stats.fingerprint.limit)} calls used
              </div>
              <div style={{ height: 6, background: 'var(--theme-elevation-100)', borderRadius: 3, marginTop: 6 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (stats.fingerprint.used / Math.max(1, stats.fingerprint.limit)) * 100)}%`,
                    background: stats.fingerprint.used >= stats.fingerprint.limit * 0.7 ? '#b4462f' : '#1d7a55',
                    borderRadius: 3,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginTop: 6 }}>
                {stats.fingerprint.requireConsent
                  ? 'Used only for readers who accepted analytics.'
                  : 'Used for every visitor with no ID.'}{' '}
                An email goes to the contact address at 70%.
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--theme-elevation-600)', marginBottom: 6 }}>
        Most-read articles, 30 days (unique readers)
      </div>
      {stats.articles.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-500)' }}>No article reads counted yet.</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
          {stats.articles.map((a) => (
            <li key={a.slug} style={{ padding: '3px 0' }}>
              {a.title ?? a.slug} <span style={{ color: 'var(--theme-elevation-500)' }}>— {n(a.readers)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
