import 'server-only'
import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

/**
 * Resend, for the newsletter.
 *
 * Gmail over SMTP told us one thing about a copy — that the server took it —
 * and sent each address in its own conversation, about a second and a half
 * apiece against a 60-second function limit. Resend takes a hundred copies
 * per request and then reports what happened to each one: delivered,
 * bounced, marked as spam, opened, clicked. That report is the point.
 *
 * Used only when RESEND_API_KEY and RESEND_FROM are both set. RESEND_FROM
 * must be an address on a domain verified in Resend; until there is one,
 * Resend sends only to the account owner, which is fine for testing and
 * useless for a list — so production stays on Gmail until RESEND_FROM is set.
 */

const API = 'https://api.resend.com'
const BATCH = 100

export const resendEnabled = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM)

export type OutgoingEmail = {
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

export type SendResult = { email: string; id?: string; error?: string }

async function call(path: string, body: unknown, idempotencyKey?: string) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  })
  const json: any = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

/** Resend's refusals, said the way the send log says things. */
const plain = (json: any, status: number): string => {
  const msg = String(json?.message ?? json?.error ?? `Resend refused the request (${status})`)
  if (/own email address|verify a domain/i.test(msg)) {
    return 'Resend is in test mode: until a domain is verified it sends only to the account owner'
  }
  if (status === 429) return 'Sending too fast for Resend — try again in a minute'
  if (status === 401 || status === 403) return `Resend rejected the API key or sender: ${msg}`
  return msg.slice(0, 180)
}

/**
 * Sends every message, a hundred to a request.
 *
 * Resend validates a batch as a whole, so one bad address — or, in test mode,
 * one address that is not the owner's — fails all hundred. When a batch is
 * refused it is retried one message at a time, so each address gets its own
 * answer instead of sharing a neighbour's.
 *
 * The idempotency key makes a retried request (a timeout, a double click)
 * come back with the original result rather than sending twice.
 */
export async function sendAll(emails: OutgoingEmail[]): Promise<SendResult[]> {
  const from = process.env.RESEND_FROM!
  const run = randomUUID()
  const out: SendResult[] = []

  for (let i = 0; i < emails.length; i += BATCH) {
    const chunk = emails.slice(i, i + BATCH)
    const payload = chunk.map((e) => ({ from, ...e, to: [e.to] }))
    const res = await call('/emails/batch', payload, `${run}-${i}`)

    if (res.ok && Array.isArray(res.json?.data) && res.json.data.length === chunk.length) {
      chunk.forEach((e, n) => out.push({ email: e.to, id: res.json.data[n]?.id }))
      continue
    }

    for (const [n, e] of chunk.entries()) {
      const one = await call('/emails', { from, ...e, to: [e.to] }, `${run}-${i}-${n}`)
      out.push(one.ok ? { email: e.to, id: one.json?.id } : { email: e.to, error: plain(one.json, one.status) })
    }
  }
  return out
}

/**
 * Checks that a webhook really came from Resend.
 *
 * Resend signs through Svix: HMAC-SHA256 over "id.timestamp.body" with the
 * base64 part of the whsec_ secret, sent as one or more "v1,<sig>" values.
 * Anything older than five minutes is refused so a captured request cannot
 * be replayed later to unsubscribe somebody.
 */
export function verifyWebhook(body: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  const id = headers.get('svix-id')
  const ts = headers.get('svix-timestamp')
  const sigs = headers.get('svix-signature')
  if (!secret || !id || !ts || !sigs) return false
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest()
  return sigs.split(' ').some((part) => {
    const [, sig] = part.split(',')
    if (!sig) return false
    const given = Buffer.from(sig, 'base64')
    return given.length === expected.length && timingSafeEqual(given, expected)
  })
}
