const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const muted = 'var(--theme-elevation-600)'
const strong = 'var(--theme-elevation-800)'
const line = '1px solid var(--theme-elevation-100)'

/**
 * The homepage, top to bottom, in the order a reader scrolls it.
 *
 * An earlier version of this panel implied each report type had its own
 * home on the page. It does not: the general strips pull from all four at
 * once, newest first. Only two strips are tied to one type, and saying so
 * plainly is the whole point of the table.
 */
const STRIPS: { name: string; fed: string; who: 'all' | 'one' | 'labels' }[] = [
  {
    name: 'Big story and the two side columns',
    fed: 'The 11 most recent pieces, whatever type they are',
    who: 'all',
  },
  {
    name: 'Explore Categories',
    fed: 'Your Sections and Themes — not articles',
    who: 'labels',
  },
  { name: 'The three round photos', fed: 'The next 3 most recent pieces', who: 'all' },
  {
    name: 'Latest institutional activity',
    fed: 'Smart Money Reports only — it shows the flow figures you enter',
    who: 'one',
  },
  { name: 'Video News', fed: 'The next 4 most recent pieces', who: 'all' },
  { name: 'In depth', fed: 'The next 5 most recent pieces', who: 'all' },
  { name: 'Highlight Stories', fed: 'The next 5 most recent pieces', who: 'all' },
  { name: 'Latest Stories', fed: 'The next 7 most recent pieces', who: 'all' },
  { name: 'Sector Themes', fed: 'Theme Reports only', who: 'one' },
  { name: 'Popular News (sidebar)', fed: 'Whatever has the most views', who: 'all' },
]

const TAG: Record<string, { label: string; color: string }> = {
  all: { label: 'Any type', color: 'var(--theme-elevation-500)' },
  one: { label: 'One type', color: '#0073ff' },
  labels: { label: 'Labels', color: '#8a6516' },
}

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
      <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>How this site is put together</h3>
      <p style={{ margin: '0 0 22px', color: muted, fontSize: 14, maxWidth: '68ch' }}>
        Two kinds of thing live in the sidebar, and they behave completely differently.
      </p>

      {/* ---------------------------------------- content vs the labels --- */}
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <div style={{ border: line, borderRadius: 6, padding: '14px 16px' }}>
          <strong style={{ fontSize: 14, color: strong }}>Content — what you write</strong>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: muted }}>
            Smart Money Reports, Macro Notes, Theme Reports, Wealth Articles and Pages. Each one is
            a thing a reader opens and reads. You create these.
          </p>
        </div>
        <div style={{ border: line, borderRadius: 6, padding: '14px 16px' }}>
          <strong style={{ fontSize: 14, color: strong }}>Menu &amp; Labels — how it is filed</strong>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: muted }}>
            Sections, Themes and Sectors. Nobody reads these; they are the shelves. You set them up
            once, then <em>pick</em> them on each article. Editing one moves the menu for the whole
            site.
          </p>
        </div>
      </div>

      {/* -------------------------------------------- the three labels --- */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, marginTop: 22 }}>
        <tbody>
          {[
            [
              'Section',
              'The one that matters. It decides which menu link the article appears under, and it is required on every piece.',
            ],
            [
              'Theme',
              'A subject that cuts across types — AI, Defence, Renewables. Becomes a tile in Explore Categories and a link in the menu bar. A theme with nothing published behind it hides itself.',
            ],
            [
              'Sector',
              'An industry label for the company in a Smart Money Report — Banking, IT, Pharma.',
            ],
          ].map(([k, v]) => (
            <tr key={k} style={{ borderTop: line }}>
              <th
                scope="row"
                style={{
                  textAlign: 'left',
                  padding: '10px 16px 10px 0',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                  color: strong,
                }}
              >
                {k}
              </th>
              <td style={{ padding: '10px 0', color: 'var(--theme-elevation-700)' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------------------------------------ homepage map --- */}
      <h4 style={{ margin: '26px 0 4px', fontSize: 15, color: strong }}>
        The homepage, top to bottom
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 13.5, color: muted, maxWidth: '68ch' }}>
        Most strips take whatever is newest, regardless of type — so a Macro Note and a Wealth
        Article compete for the same slots. Publish date decides the order. Only two strips are
        tied to one type.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <tbody>
            {STRIPS.map((s) => (
              <tr key={s.name} style={{ borderTop: line }}>
                <th
                  scope="row"
                  style={{
                    textAlign: 'left',
                    padding: '9px 16px 9px 0',
                    fontWeight: 500,
                    color: strong,
                    whiteSpace: 'nowrap',
                    verticalAlign: 'top',
                  }}
                >
                  {s.name}
                </th>
                <td style={{ padding: '9px 16px 9px 0', color: 'var(--theme-elevation-700)' }}>
                  {s.fed}
                </td>
                <td style={{ padding: '9px 0', verticalAlign: 'top' }}>
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: TAG[s.who].color,
                      border: `1px solid ${TAG[s.who].color}55`,
                      borderRadius: 100,
                      padding: '2px 8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {TAG[s.who].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ margin: '16px 0 0', fontSize: 13, color: muted, maxWidth: '68ch' }}>
        Every article also gets its own page, and appears on its section&rsquo;s page — the one its
        menu link opens.
      </p>

      {/* ------------------------------------------------- good to know --- */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: line,
          display: 'grid',
          gap: 8,
          fontSize: 13,
          color: 'var(--theme-elevation-700)',
        }}
      >
        <strong style={{ fontSize: 13, color: strong }}>Good to know</strong>
        <span>
          <strong>Nothing is live until you press Publish changes.</strong> Everything autosaves as
          a draft, however long you leave it. Use Preview to see a draft on the real site.
        </span>
        <span>
          <strong>Images are two steps.</strong> Upload to Images, then open the article and pick it
          under <em>Main image</em>. Uploading alone does not attach it to anything. Holding a link
          rather than a file? Use <em>Add from URL</em> at the top of Images.
        </span>
        <span>
          <strong>Publishing is immediate.</strong> The pages a piece appears on refresh on their
          next load — see{' '}
          <a href={SITE} target="_blank" rel="noreferrer">
            the live site
          </a>
          .
        </span>
      </div>
    </div>
  )
}
