import type { NextRequest } from 'next/server'
import { client } from '@/lib/queries'

export const dynamic = 'force-dynamic'

/**
 * Reports whether this deployment can actually send mail.
 *
 * Every place the site sends email swallows its own failures on purpose — an
 * enquiry must not be lost because a mail server is down — so a broken
 * configuration looks identical to a working one from the outside. Locally
 * `npm run email:test` fills that gap. On a deployment there was nothing, and
 * reading the platform's logs is not always possible: on Vercel they are
 * visible only to whoever owns the project.
 *
 * So the deployment answers for itself. Sign in to the admin, then open
 * /api/email-health.
 *
 *   GET /api/email-health         what is configured, and does the server
 *                                 accept the credentials
 *   GET /api/email-health?send=you@example.com
 *                                 the above, then actually send there and
 *                                 report what the mail server said
 *
 * Requires a logged-in Payload user. It discloses which variables are set,
 * which is not secret but is nobody else's business, and the ?send form can
 * put mail in someone's inbox.
 *
 * No secret value is ever returned — only whether one is present, and how
 * long it is, which is enough to spot the usual mistake of pasting a Google
 * app password with its spaces or with something extra on the end.
 */
export async function GET(req: NextRequest) {
  const payload = await client()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return Response.json({ error: 'Sign in to the admin panel first.' }, { status: 403 })
  }

  const host = process.env.SMTP_HOST ?? null
  const rawPass = process.env.SMTP_PASS ?? ''
  const pass = rawPass.replace(/\s+/g, '')

  const config = {
    smtpHost: host,
    smtpPort: process.env.SMTP_PORT ?? '(unset, defaults to 587)',
    smtpUser: process.env.SMTP_USER ?? null,
    emailFrom: process.env.EMAIL_FROM ?? null,
    passSet: Boolean(rawPass),
    passLengthRaw: rawPass.length,
    passLengthStripped: pass.length,
    // A Google app password is sixteen characters once spaces are removed.
    passLooksLikeGoogleAppPassword: pass.length === 16,
    fromMatchesUser: process.env.EMAIL_FROM === process.env.SMTP_USER,
    adapterActive: Boolean(host),
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? '(not on Vercel)',
  }

  if (!host) {
    return Response.json({
      ok: false,
      diagnosis:
        'SMTP_HOST is not set in this environment, so Payload has no mail ' +
        'adapter and writes messages to the log instead of sending them. ' +
        'On Vercel, check the variable exists for the environment named in ' +
        'vercelEnv below, then redeploy — variables are read at build time.',
      config,
    })
  }

  const settings: any = await payload.findGlobal({ slug: 'site-settings' })
  const contactEmail = settings?.contactEmail ?? null

  const to = req.nextUrl.searchParams.get('send')
  if (!to) {
    return Response.json({
      ok: true,
      diagnosis:
        'An adapter is configured. This does not prove the credentials work ' +
        '— add ?send=you@example.com to attempt a real delivery.',
      contactEmail,
      config,
    })
  }

  const stamp = new Date().toISOString()
  try {
    await payload.sendEmail({
      to,
      subject: `Email health check (${stamp})`,
      text: [
        'Sent by /api/email-health on the live site.',
        '',
        `Environment : ${config.vercelEnv}`,
        `From        : ${config.emailFrom}`,
        `Host        : ${config.smtpHost}`,
        `Time        : ${stamp}`,
      ].join('\n'),
    })
    return Response.json({
      ok: true,
      sent: true,
      to,
      diagnosis: 'The mail server accepted the message. Check that inbox, and its spam folder.',
      contactEmail,
      config,
    })
  } catch (err: any) {
    return Response.json(
      {
        ok: false,
        sent: false,
        to,
        diagnosis: 'The mail server refused the message. The error is below verbatim.',
        error: String(err?.message ?? err),
        code: err?.code ?? err?.responseCode ?? null,
        contactEmail,
        config,
      },
      { status: 502 },
    )
  }
}
