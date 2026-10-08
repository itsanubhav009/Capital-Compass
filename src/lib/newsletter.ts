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
 * Deliberately plain HTML with inline styles and a table for the button:
 * email clients strip stylesheets, ignore flexbox and disagree about almost
 * everything else. Anything cleverer looks broken in Outlook.
 */
export function buildArticleEmail(opts: {
  title: string
  standfirst?: string | null
  category?: string | null
  url: string
  imageUrl?: string | null
  siteName: string
  unsubscribe: string
}): ArticleEmail {
  const { title, standfirst, category, url, imageUrl, siteName, unsubscribe } = opts

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;">
        <tr><td style="background:#121213;padding:18px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.2px;">${escape(siteName)}</span>
        </td></tr>
        ${
          imageUrl
            ? `<tr><td><img src="${escape(imageUrl)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;"></td></tr>`
            : ''
        }
        <tr><td style="padding:28px;">
          ${
            category
              ? `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#b4462f;">${escape(category)}</p>`
              : ''
          }
          <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#121213;font-weight:600;">${escape(title)}</h1>
          ${
            standfirst
              ? `<p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#4a4a4d;">${escape(standfirst)}</p>`
              : ''
          }
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#b4462f;border-radius:4px;">
              <a href="${escape(url)}" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Read the full article</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:18px 28px 26px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8d;">
            You are receiving this because you subscribed to ${escape(siteName)}.<br>
            <a href="${escape(unsubscribe)}" style="color:#8a8a8d;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const text = [
    category ? category.toUpperCase() : '',
    title,
    '',
    standfirst ?? '',
    '',
    `Read it here: ${url}`,
    '',
    '--',
    `You are receiving this because you subscribed to ${siteName}.`,
    `Unsubscribe: ${unsubscribe}`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return { subject: title, html, text }
}
