import 'server-only'
import { ImapFlow } from 'imapflow'

/**
 * Which Gmail tab a newsletter landed in, for the inboxes we can look inside.
 *
 * No sender is told where its mail went. Resend can say "delivered"; only
 * the mailbox knows whether that meant Primary, Promotions or Spam. So a few
 * seed accounts — Gmail addresses the owner controls, subscribed like anyone
 * else — are signed into over IMAP after a send, and Gmail's own search
 * (X-GM-RAW, the same syntax as the search box) is asked which category the
 * copy carries. It is a sample, not a census, but it is the same sample the
 * paid inbox-placement services use, and it moves when the real list does.
 *
 * SEED_INBOXES="me@gmail.com:apppassword,other@gmail.com:apppassword"
 * Each needs IMAP on (Gmail settings → Forwarding and POP/IMAP) and an app
 * password, which requires 2-Step Verification.
 */

export type Seed = { email: string; pass: string }

export function seeds(): Seed[] {
  return (process.env.SEED_INBOXES ?? '')
    .split(',')
    .map((pair) => {
      const i = pair.indexOf(':')
      return i > 0
        ? { email: pair.slice(0, i).trim().toLowerCase(), pass: pair.slice(i + 1).replace(/\s+/g, '') }
        : null
    })
    .filter((s): s is Seed => Boolean(s?.email && s.pass))
}

const TABS: [string, string][] = [
  ['category:primary', 'Primary'],
  ['category:promotions', 'Promotions'],
  ['category:updates', 'Updates'],
  ['category:social', 'Social'],
  ['category:forums', 'Forums'],
]

/**
 * Looks for one subject in one seed mailbox, sent on or after `since`.
 *
 * Spam is checked first and separately: Gmail keeps it out of All Mail, so a
 * search there would report a spammed copy as missing.
 */
export async function placementFor(seed: Seed, subject: string, since: Date): Promise<string> {
  const day = new Date(since.getTime() - 86_400_000)
  const after = `after:${day.getUTCFullYear()}/${day.getUTCMonth() + 1}/${day.getUTCDate()}`
  const query = `subject:"${subject.replace(/["\\]/g, ' ').trim()}" ${after}`

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: seed.email, pass: seed.pass },
    logger: false,
  })
  try {
    await client.connect()
    const boxes = await client.list()
    const all = boxes.find((b) => b.specialUse === '\\All')?.path ?? '[Gmail]/All Mail'
    const junk = boxes.find((b) => b.specialUse === '\\Junk')?.path ?? '[Gmail]/Spam'

    const has = async (box: string, raw: string) => {
      const lock = await client.getMailboxLock(box)
      try {
        const hits = await client.search({ gmraw: raw } as any, { uid: true })
        return Array.isArray(hits) && hits.length > 0
      } finally {
        lock.release()
      }
    }

    if (await has(junk, query)) return 'Spam'
    if (!(await has(all, query))) return 'Not arrived yet'
    for (const [cat, label] of TABS) if (await has(all, `${query} ${cat}`)) return label
    // Found, but in no category: the account has inbox tabs switched off.
    return 'Inbox (tabs off)'
  } catch (err: any) {
    const msg = String(err?.responseText ?? err?.message ?? err)
    if (/AUTHENTICATIONFAILED|Invalid credentials|Application-specific/i.test(msg)) {
      return 'Could not sign in — check the app password and that IMAP is on'
    }
    return `Could not check: ${msg.slice(0, 120)}`
  } finally {
    await client.logout().catch(() => {})
  }
}
