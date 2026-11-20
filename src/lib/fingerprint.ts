import 'server-only'
import { vectorPool } from '@/lib/embeddings'
import { notifyOwner } from '@/lib/alerts'

/**
 * Fingerprint, for the visitors who arrive with no ID of ours.
 *
 * Off until FINGERPRINT_PUBLIC_KEY and FINGERPRINT_SECRET_KEY are set; until
 * then counting works exactly as phase 1. The public key goes to the browser
 * at run time (not baked into the build), so turning it on is a matter of
 * setting the variables, not redeploying code.
 *
 *   FINGERPRINT_PUBLIC_KEY     browser key from the Fingerprint dashboard
 *   FINGERPRINT_SECRET_KEY     Server API key, never sent to the browser
 *   FINGERPRINT_REGION         us | eu | ap — the region the account is in
 *   FINGERPRINT_MONTHLY_LIMIT  calls allowed a month (default 1000, the free plan)
 *   FINGERPRINT_REQUIRE_CONSENT  "false" to identify visitors who have not
 *                              accepted analytics. Default true. Device
 *                              fingerprinting is personal data under GDPR and
 *                              India's DPDP Act; turning this off is a legal
 *                              decision, not a technical one. Left on, a
 *                              private window or cleared storage has also lost
 *                              the reader's "Accept", so those visitors are
 *                              not fingerprinted until they accept again.
 */

export type Region = 'us' | 'eu' | 'ap'

export function fingerprintConfig() {
  const publicKey = process.env.FINGERPRINT_PUBLIC_KEY?.trim()
  const secretKey = process.env.FINGERPRINT_SECRET_KEY?.trim()
  const r = (process.env.FINGERPRINT_REGION ?? 'us').trim().toLowerCase()
  const region: Region = r === 'eu' || r === 'ap' ? r : 'us'
  const limit = Number(process.env.FINGERPRINT_MONTHLY_LIMIT) || 1000
  const requireConsent = (process.env.FINGERPRINT_REQUIRE_CONSENT ?? 'true').trim().toLowerCase() !== 'false'
  return publicKey && secretKey ? { publicKey, secretKey, region, limit, requireConsent } : null
}

const apiHost = (region: Region) =>
  region === 'eu' ? 'https://eu.api.fpjs.io' : region === 'ap' ? 'https://ap.api.fpjs.io' : 'https://api.fpjs.io'

/** "2026-11", in India time, so the budget turns over when the owner's month does. */
const thisMonth = () =>
  new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 7)

/** Calls used this month, and whether another is allowed. */
export async function budget(): Promise<{ used: number; limit: number; allowed: boolean }> {
  const cfg = fingerprintConfig()
  if (!cfg) return { used: 0, limit: 0, allowed: false }
  const r = await vectorPool().query(`SELECT calls FROM fingerprint_usage WHERE month = $1`, [thisMonth()])
  const used = r.rows[0]?.calls ?? 0
  return { used, limit: cfg.limit, allowed: used < cfg.limit }
}

/**
 * Counts one identification call, and emails the owner once a month when
 * usage crosses 70% of the limit — enough warning to decide between
 * upgrading and letting ID-less visitors fall back to a cookie.
 */
export async function recordCall() {
  const cfg = fingerprintConfig()
  if (!cfg) return
  const db = vectorPool()
  const month = thisMonth()
  const r = await db.query(
    `INSERT INTO fingerprint_usage (month, calls) VALUES ($1, 1)
       ON CONFLICT (month) DO UPDATE SET calls = fingerprint_usage.calls + 1
     RETURNING calls`,
    [month],
  )
  const calls = r.rows[0]?.calls ?? 0
  if (calls < Math.ceil(cfg.limit * 0.7)) return
  // Claimed in the UPDATE, so only one request sends the alert.
  const claim = await db.query(
    `UPDATE fingerprint_usage SET alerted_at = now() WHERE month = $1 AND alerted_at IS NULL`,
    [month],
  )
  if (!claim.rowCount) return
  await notifyOwner(
    `Fingerprint: ${calls} of ${cfg.limit} free calls used this month`,
    [
      `Visitor counting has used ${calls} of this month's ${cfg.limit} Fingerprint calls (70%).`,
      '',
      'Calls are spent only on visitors who arrive with no ID of ours: new readers,',
      'private windows, and people who cleared their cookies. Returning readers cost nothing.',
      '',
      `When the ${cfg.limit} are used, visitors with no ID are still counted, by a new cookie ID,`,
      'but a returning reader who cleared cookies may then be counted twice. Those hits are',
      'marked "over-limit" in the log, so the numbers can be read knowing which ones.',
      '',
      'To keep full accuracy, upgrade the Fingerprint plan and raise FINGERPRINT_MONTHLY_LIMIT on Vercel.',
    ].join('\n'),
  )
}

/**
 * Asks Fingerprint's Server API whether a request the browser reported is
 * real, recent and for the visitor it claims.
 *
 * The browser's word alone would let anyone post invented IDs and inflate
 * the count. Returns the confirmed visitor ID, null if it does not check
 * out, or 'bot' when Fingerprint's bot detection flags it.
 */
export async function verify(requestId: string, claimedVisitorId: string): Promise<string | 'bot' | null> {
  const cfg = fingerprintConfig()
  if (!cfg || !/^[\w.-]{6,80}$/.test(requestId)) return null
  try {
    const res = await fetch(`${apiHost(cfg.region)}/events/${encodeURIComponent(requestId)}`, {
      headers: { 'Auth-API-Key': cfg.secretKey },
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json: any = await res.json()
    const data = json?.products?.identification?.data
    if (!data?.visitorId || data.visitorId !== claimedVisitorId) return null
    // A request older than ten minutes is a replay, not a page view.
    if (typeof data.timestamp === 'number' && Date.now() - data.timestamp > 10 * 60_000) return null
    if (json?.products?.botd?.data?.bot?.result === 'bad') return 'bot'
    return data.visitorId
  } catch (err) {
    console.error('[fingerprint] verification failed', err)
    return null
  }
}
