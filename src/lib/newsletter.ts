import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Shared pieces for sending an article to the subscriber list.
 *
 * The sending itself lives in the route; this is the part that has to be
 * identical between the mail that goes out and the unsubscribe link that
 * comes back, so it lives in one file rather than two.
 */

/** Absolute base for links in an email, where a relative path is useless. */
export function siteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter(Boolean) as string[]
  return (candidates[0] ?? 'http://localhost:3000').replace(/\/$/, '')
}

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

/**
 * One article, as an email.
 *
 * Built as tables with inline styles, which is not how anyone would write a
 * page today but is the only thing email clients agree on: stylesheets get
 * stripped, flexbox and grid are ignored, and Outlook renders through Word.
 * Anything cleverer looks broken somewhere that matters.
 *
 * The type follows the site — Newsreader for the words, falling back to
 * Georgia, since no mail client will fetch a webfont; Inter falling back to
 * the system stack for the small print. Both land on a serif and a sans that
 * sit close enough to the site that the email reads as coming from it.
 *
 * The footer is not decoration. Bulk email has to say who sent it, give a
 * postal address and offer a way out, and inbox providers treat a missing
 * unsubscribe or address as a spam signal regardless of the law.
 */
export function buildArticleEmail(opts: {
  title: string
  standfirst?: string | null
  category?: string | null
  url: string
  imageUrl?: string | null
  siteName: string
  unsubscribe: string
  postalAddress?: string | null
  date?: string | null
}): ArticleEmail {
  const { title, standfirst, category, url, imageUrl, siteName, unsubscribe, postalAddress, date } =
    opts

  const serif = `'Newsreader', Georgia, 'Times New Roman', serif`
  const sans = `'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

  // The line inboxes show beside the subject. Without one they fall back to
  // whatever text comes first, which is usually the word "View".
  const preheader = standfirst ? standfirst.slice(0, 140) : `New from ${siteName}`

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:24px 12px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">

        <tr><td style="background:#121213;padding:20px 32px;">
          <a href="${escape(url)}" style="font-family:${serif};font-size:19px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${escape(siteName)}</a>
        </td></tr>

        ${
          imageUrl
            ? `<tr><td><a href="${escape(url)}"><img src="${escape(imageUrl)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>`
            : ''
        }

        <tr><td style="padding:32px 32px 28px;">
          ${
            category
              ? `<p style="margin:0 0 12px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:1.3px;text-transform:uppercase;color:#b4462f;">${escape(category)}</p>`
              : ''
          }
          <h1 style="margin:0 0 16px;font-family:${serif};font-size:28px;line-height:1.25;font-weight:600;color:#121213;">
            <a href="${escape(url)}" style="color:#121213;text-decoration:none;">${escape(title)}</a>
          </h1>
          ${
            standfirst
              ? `<p style="margin:0 0 26px;font-family:${serif};font-size:17px;line-height:1.65;color:#4a4a4d;">${escape(standfirst)}</p>`
              : ''
          }

          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background:#b4462f;border-radius:4px;">
              <a href="${escape(url)}" style="display:inline-block;padding:13px 26px;font-family:${sans};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Read the full article</a>
            </td>
          </tr></table>

          ${
            date
              ? `<p style="margin:22px 0 0;font-family:${sans};font-size:13px;color:#8a8a8d;">Published ${escape(date)}</p>`
              : ''
          }
        </td></tr>

        <tr><td style="padding:22px 32px 28px;border-top:1px solid #e5e5e5;background:#fafafa;">
          <p style="margin:0 0 10px;font-family:${sans};font-size:12px;line-height:1.65;color:#6a6a6d;">
            You are receiving this because you subscribed to ${escape(siteName)}.<br>
            <a href="${escape(unsubscribe)}" style="color:#6a6a6d;text-decoration:underline;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <a href="${escape(url)}" style="color:#6a6a6d;text-decoration:underline;">View in your browser</a>
          </p>
          ${
            postalAddress
              ? `<p style="margin:0 0 10px;font-family:${sans};font-size:12px;line-height:1.6;color:#8a8a8d;">${escape(postalAddress).replace(/\n/g, '<br>')}</p>`
              : ''
          }
          <p style="margin:0;font-family:${sans};font-size:11.5px;line-height:1.6;color:#9a9a9d;">
            ${escape(siteName)} publishes financial journalism, not investment advice. Nothing here is a
            recommendation to buy or sell any security.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`

  const text = [
    category ? category.toUpperCase() : null,
    title,
    '',
    standfirst ?? null,
    '',
    `Read it here: ${url}`,
    date ? `Published ${date}` : null,
    '',
    '--',
    `You are receiving this because you subscribed to ${siteName}.`,
    `Unsubscribe: ${unsubscribe}`,
    postalAddress ?? null,
    '',
    `${siteName} publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security.`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return { subject: title, html, text }
}
