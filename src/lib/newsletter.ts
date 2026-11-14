import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { siteUrl } from './site-url'

/**
 * Shared pieces for sending an article to the subscriber list.
 *
 * The sending itself lives in the route; this is the part that has to be
 * identical between the mail that goes out and the unsubscribe link that
 * comes back, so it lives in one file rather than two.
 */

/** Absolute base for links in an email, where a relative path is useless. */
export { siteUrl }

/**
 * Unsubscribe tokens are derived, not stored.
 *
 * An HMAC of the address under PAYLOAD_SECRET means no column, no migration
 * and no way to unsubscribe somebody else by guessing an id — the link only
 * works for the address it was minted for. It also survives a subscriber row
 * being deleted and recreated, which a random stored token would not.
 */
export function unsubscribeToken(email: string): string {
  const secret = process.env.PAYLOAD_SECRET || ''
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

/** Constant-time compare, so the token cannot be recovered a byte at a time. */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(String(token ?? ''))
  if (expected.length !== given.length) return false
  return timingSafeEqual(expected, given)
}

export function unsubscribeUrl(email: string): string {
  const q = new URLSearchParams({ email, token: unsubscribeToken(email) })
  return `${siteUrl()}/api/unsubscribe?${q.toString()}`
}

const escape = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export type ArticleEmail = { subject: string; html: string; text: string }

/** A headline in one of the lists under the lead story. */
export type DigestItem = {
  title: string
  url: string
  /** "by" line under an analysis item — the section, as there are no authors. */
  byline?: string | null
  date?: string | null
  thumbUrl?: string | null
}

/**
 * Plain text from a Lexical document, for the lead story's excerpt.
 *
 * Paragraph boundaries become spaces so words from adjacent blocks do not
 * run together. Only text nodes count; images, embeds and the like have none.
 */
export function lexicalToText(doc: any): string {
  const out: string[] = []
  const walk = (node: any) => {
    if (!node) return
    if (typeof node.text === 'string') out.push(node.text)
    if (Array.isArray(node.children)) {
      node.children.forEach(walk)
      out.push(' ')
    }
  }
  walk(doc?.root)
  return out.join('').replace(/\s+/g, ' ').trim()
}

/** Cut at a word boundary and mark the cut, as the excerpt is a teaser. */
export function excerpt(text: string, max = 220): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '').replace(/[\s,;:.–—-]+$/, '') + '...'
}

/**
 * One article, as a digest email.
 *
 * Laid out the way the market newsletters readers already get are laid out —
 * Investing.com's Daily Digest was the model the owner asked for: the
 * headline large, the picture, a few lines that stop mid-thought, Read More,
 * then two lists of the other stories. A single story with a button was easy
 * to ignore; a digest gives a reader who does not care about the lead
 * something else to click.
 *
 * Built as tables with inline styles, which is not how anyone would write a
 * page today but is the only thing email clients agree on: stylesheets get
 * stripped, flexbox and grid are ignored, and Outlook renders through Word.
 * Arial throughout, as no mail client will fetch a webfont.
 *
 * The footer is not decoration. Bulk email has to say who sent it, give a
 * postal address and offer a way out, and inbox providers treat a missing
 * unsubscribe or address as a spam signal regardless of the law.
 */
export function buildArticleEmail(opts: {
  title: string
  standfirst?: string | null
  /** Opening of the body; falls back to the standfirst. Truncated here. */
  bodyText?: string | null
  url: string
  imageUrl?: string | null
  siteName: string
  tagline?: string | null
  /** Who this copy is addressed to, printed in the footer. */
  recipient: string
  unsubscribe: string
  postalAddress?: string | null
  disclaimer?: string | null
  /** Where the thumbs up / down replies go. Hidden when unset. */
  feedbackEmail?: string | null
  date?: string | null
  topNews?: DigestItem[]
  topAnalysis?: DigestItem[]
}): ArticleEmail {
  const {
    title,
    standfirst,
    bodyText,
    url,
    imageUrl,
    siteName,
    tagline,
    recipient,
    unsubscribe,
    postalAddress,
    disclaimer,
    feedbackEmail,
    date,
    topNews = [],
    topAnalysis = [],
  } = opts

  const base = siteUrl()
  const font = `Arial, Helvetica, sans-serif`
  const ink = '#333333'
  const grey = '#a3a3a3'
  const link = '#1a73e8'
  const lead = excerpt(bodyText || standfirst || '')
  const year = new Date().getFullYear()

  // The line inboxes show beside the subject. Without one they fall back to
  // whatever text comes first, which here would be the tagline.
  const preheader = (standfirst || lead || `New from ${siteName}`).slice(0, 140)

  const sectionHead = (label: string, more: string, moreLabel: string) => `
        <tr><td style="padding:44px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:${font};font-size:30px;line-height:1.2;font-weight:700;color:${ink};">${escape(label)}</td>
            <td align="right" style="font-family:${font};font-size:15px;white-space:nowrap;vertical-align:middle;">
              <a href="${escape(more)}" style="color:${link};text-decoration:none;">${escape(moreLabel)} &raquo;</a>
            </td>
          </tr></table>
        </td></tr>`

  const newsRows = topNews
    .map(
      (n) => `
        <tr><td style="padding:12px 32px 4px;font-family:${font};font-size:17px;line-height:1.45;color:${ink};">
          <span style="font-size:15px;">&#128226;</span>&nbsp;
          <a href="${escape(n.url)}" style="color:${ink};text-decoration:none;">${escape(n.title)}</a>
        </td></tr>`,
    )
    .join('')

  const analysisRows = topAnalysis
    .map(
      (a) => `
        <tr><td style="padding:12px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            ${
              a.thumbUrl
                ? `<td width="54" valign="top" style="padding-right:16px;"><a href="${escape(a.url)}"><img src="${escape(a.thumbUrl)}" alt="" width="54" height="54" style="display:block;width:54px;height:54px;object-fit:cover;border:0;"></a></td>`
                : ''
            }
            <td valign="top" style="font-family:${font};">
              <a href="${escape(a.url)}" style="font-size:17px;line-height:1.4;color:#111111;text-decoration:none;">${escape(a.title)}</a>
              ${
                a.byline || a.date
                  ? `<div style="margin-top:5px;font-size:12px;color:#555555;">${[
                      a.byline ? `by ${escape(a.byline)}` : null,
                      a.date ? escape(a.date) : null,
                    ]
                      .filter(Boolean)
                      .join('&nbsp; | &nbsp;')}</div>`
                  : ''
              }
            </td>
          </tr></table>
        </td></tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:20px 0 40px;">

      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;">

        ${
          tagline
            ? `<tr><td align="center" style="padding:0 32px 26px;font-family:${font};font-size:16px;font-weight:700;color:${grey};">${escape(tagline)}</td></tr>`
            : ''
        }

        <tr><td align="center" style="padding:0 32px;font-family:${font};font-size:26px;font-weight:700;letter-spacing:-0.3px;">
          <a href="${escape(base)}" style="color:#111111;text-decoration:none;">${escape(siteName)}</a>
        </td></tr>
        <tr><td align="center" style="padding:6px 32px 0;font-family:${font};font-size:11px;">
          <a href="${escape(url)}" style="color:#999999;text-decoration:none;">Online Version</a>
        </td></tr>

        <tr><td align="center" style="padding:34px 32px 0;font-family:${font};font-size:22px;font-weight:700;color:${ink};">
          Daily Digest <span style="font-weight:700;">|</span>${
            date ? ` <span style="font-size:15px;font-weight:400;">${escape(date)}</span>` : ''
          }
        </td></tr>

        <tr><td align="center" style="padding:24px 32px 22px;">
          <h1 style="margin:0;text-align:center;font-family:${font};font-size:38px;line-height:1.22;font-weight:700;color:${ink};">
            <a href="${escape(url)}" style="color:${ink};text-decoration:none;">${escape(title)}</a>
          </h1>
        </td></tr>

        ${
          imageUrl
            ? `<tr><td align="center" style="padding:0 32px;"><a href="${escape(url)}"><img src="${escape(imageUrl)}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;"></a></td></tr>`
            : ''
        }

        ${
          lead
            ? `<tr><td align="center" style="padding:22px 32px 0;text-align:center;font-family:${font};font-size:17px;line-height:1.65;color:${ink};">${escape(lead)}</td></tr>`
            : ''
        }

        <tr><td align="center" style="padding:30px 32px 0;">
          <a href="${escape(url)}" style="font-family:${font};font-size:22px;font-weight:700;color:${grey};text-decoration:none;">Read More</a>
        </td></tr>

        ${topNews.length ? sectionHead("Today's Top News", base, 'Read More News') + newsRows : ''}

        ${topAnalysis.length ? sectionHead("Today's Top Analysis", base, 'Read More Analysis') + analysisRows : ''}

        ${
          feedbackEmail
            ? `<tr><td align="center" style="padding:56px 32px 0;font-family:${font};">
          <div style="font-size:30px;font-weight:700;color:#000000;">How would you rate this email?</div>
          <div style="padding-top:16px;font-size:40px;line-height:1;">
            <a href="mailto:${escape(feedbackEmail)}?subject=${encodeURIComponent(`Liked: ${title}`)}" style="text-decoration:none;">&#128077;</a>
            &nbsp;&nbsp;
            <a href="mailto:${escape(feedbackEmail)}?subject=${encodeURIComponent(`Did not like: ${title}`)}" style="text-decoration:none;">&#128078;</a>
          </div>
        </td></tr>`
            : ''
        }

        <tr><td align="center" style="padding:56px 32px 0;font-family:${font};font-size:15px;color:#555555;">
          &copy; ${year} ${escape(siteName)}. All Rights Reserved.
        </td></tr>

        ${
          disclaimer
            ? `<tr><td align="center" style="padding:40px 32px 0;text-align:center;font-family:${font};font-size:13px;line-height:1.75;color:#666666;">Disclaimer:<br>${escape(disclaimer)}</td></tr>`
            : ''
        }

        <tr><td align="center" style="padding:28px 32px 0;font-family:${font};font-size:13px;color:#666666;">
          This is a newsletter from ${escape(siteName)}
        </td></tr>

        <tr><td align="center" style="padding:24px 32px 0;font-family:${font};font-size:16px;">
          <a href="${escape(unsubscribe)}" style="color:${link};text-decoration:none;">Unsubscribe</a>&nbsp;&nbsp;
          <a href="${escape(`${base}/privacy`)}" style="color:${link};text-decoration:none;">Privacy Policy</a>&nbsp;&nbsp;
          <a href="${escape(`${base}/terms`)}" style="color:${link};text-decoration:none;">Terms And Conditions</a>
        </td></tr>

        ${
          postalAddress
            ? `<tr><td align="center" style="padding:6px 32px 0;font-family:${font};font-size:14px;line-height:1.6;color:${ink};">${escape(postalAddress).replace(/\n/g, ', ')}</td></tr>`
            : ''
        }

        <tr><td align="center" style="padding:34px 32px 0;font-family:${font};font-size:14px;color:${ink};">
          This email was sent to <a href="mailto:${escape(recipient)}" style="color:${link};text-decoration:none;">${escape(recipient)}</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`

  const text = [
    `${siteName} — Daily Digest${date ? ` | ${date}` : ''}`,
    '',
    title,
    '',
    lead || null,
    `Read More: ${url}`,
    ...(topNews.length ? ['', "TODAY'S TOP NEWS", ...topNews.map((n) => `- ${n.title}\n  ${n.url}`)] : []),
    ...(topAnalysis.length
      ? [
          '',
          "TODAY'S TOP ANALYSIS",
          ...topAnalysis.map(
            (a) =>
              `- ${a.title}${a.byline || a.date ? ` (${[a.byline, a.date].filter(Boolean).join(' | ')})` : ''}\n  ${a.url}`,
          ),
        ]
      : []),
    '',
    '--',
    `© ${year} ${siteName}. All Rights Reserved.`,
    disclaimer ? `Disclaimer: ${disclaimer}` : null,
    `Unsubscribe: ${unsubscribe}`,
    postalAddress ?? null,
    `This email was sent to ${recipient}`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return { subject: title, html, text }
}

/**
 * An image address an email client will actually fetch.
 *
 * Media keeps its uploaded filename, spaces and all —
 * "LIFECYCLE ACCUMULATION STRATEGY-800x533.png". A browser quietly encodes
 * the space; Gmail's image proxy does not, and showed a broken square. The
 * URL parser encodes what needs encoding and leaves an existing %20 alone,
 * so an address is never encoded twice.
 */
const safeUrl = (u?: string | null): string | null => {
  if (!u) return null
  try {
    return new URL(u).href
  } catch {
    return null
  }
}

const day = (iso?: string | null, style: 'header' | 'item' = 'item') => {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  if (style === 'header') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  // 07-Sep-2026. Built by hand: en-GB writes September as "Sept".
  const mon = d.toLocaleDateString('en-US', { month: 'short' })
  return `${String(d.getDate()).padStart(2, '0')}-${mon}-${d.getFullYear()}`
}

/**
 * Everything in the digest except what differs per recipient.
 *
 * The lists are the latest published stories other than the lead: the six
 * newest as Top News, the five after them as Top Analysis, so nothing
 * appears twice. Looked up once per send, not once per address.
 */
export async function digestFor(payload: any, article: any) {
  const [settings, others] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({
      collection: 'articles',
      where: { and: [{ _status: { equals: 'published' } }, { id: { not_equals: article.id } }] },
      sort: '-publishedAt',
      limit: 11,
      depth: 1,
    }),
  ])
  const base = siteUrl()
  const item = (d: any): DigestItem => ({
    title: d.title,
    url: `${base}/insight/${d.slug}`,
    byline: d.section?.title ?? null,
    date: day(d.publishedAt),
    thumbUrl: safeUrl(d.featuredImage?.sizes?.thumb?.url ?? d.featuredImage?.url),
  })
  const docs = (others.docs as any[]).map(item)

  return {
    title: article.title as string,
    standfirst: (article.standfirst as string) ?? null,
    bodyText: lexicalToText(article.body),
    url: `${base}/insight/${article.slug}`,
    // The card size: 800px wide at the picture's own shape. The og size is
    // cropped to 1200×630, which cut the edges off graphics, and was half as
    // heavy again for an image shown at 536px.
    imageUrl: safeUrl(
      article?.featuredImage?.sizes?.card?.url ??
        article?.featuredImage?.sizes?.wide?.url ??
        article?.featuredImage?.url,
    ),
    siteName: (settings?.siteName as string) || 'Smart Money Express',
    tagline: (settings?.tagline as string) ?? null,
    postalAddress: (settings?.postalAddress as string) ?? null,
    disclaimer: (settings?.articleDisclaimer as string) ?? null,
    feedbackEmail: (settings?.contactEmail as string) ?? null,
    date: day(new Date().toISOString(), 'header'),
    topNews: docs.slice(0, 6),
    topAnalysis: docs.slice(6, 11),
  }
}
