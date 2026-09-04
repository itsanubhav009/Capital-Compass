const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const ROWS: { type: string; where: string }[] = [
  {
    type: 'Smart Money Report',
    where: 'Latest institutional activity tape, hero rails, and its section archive',
  },
  { type: 'Macro Note', where: 'Hero rails, Video News, Latest Stories, section archive' },
  { type: 'Theme Report', where: 'Sector Themes, the topic tiles, section archive' },
  { type: 'Wealth Article', where: 'In depth, Highlight Stories, Latest Stories' },
  { type: 'Page', where: 'Its own URL, linked from the footer' },
]

/**
 * Panel on the admin dashboard.
 *
 * Two questions come up constantly with a homepage assembled from several
 * collections: where will this land, and why can I not see it yet. The table
 * answers the first; the note answers the second.
 *
 * Deliberately a server component with no client JavaScript — it is a
 * signpost, not a feature.
 */
export default function WhereItAppears() {
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        padding: '20px 24px',
        marginBottom: 32,
      }}
    >
      <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Where your content appears</h3>
      <p style={{ margin: '0 0 18px', color: 'var(--theme-elevation-600)', fontSize: 14 }}>
        The homepage draws from every collection at once, ordered by publish date. Use{' '}
        <strong>Preview</strong> on any document to open it on the site, or the{' '}
        <strong>Live Preview</strong> tab to see it in place as you type.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.type} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
              <th
                scope="row"
                style={{
                  textAlign: 'left',
                  padding: '10px 16px 10px 0',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                }}
              >
                {r.type}
              </th>
              <td style={{ padding: '10px 0', color: 'var(--theme-elevation-700)' }}>{r.where}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: '18px 0 0', fontSize: 13, color: 'var(--theme-elevation-600)' }}>
        Publishing clears the cache for the affected pages, so changes show on{' '}
        <a href={SITE} target="_blank" rel="noreferrer">
          the live site
        </a>{' '}
        on the next load. Drafts never appear there — only in preview.
      </p>
    </div>
  )
}
