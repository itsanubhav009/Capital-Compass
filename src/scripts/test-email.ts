// Must come first: payload.config reads process.env the moment it is
// imported, and tsx does not load .env on its own.
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Sends one test email and says plainly what happened.  npm run email:test
 *
 *   npm run email:test                  -> sends to contactEmail in Site Settings
 *   npm run email:test you@example.com  -> sends to that address instead
 *
 * Why a script rather than "just use the contact form": every place the site
 * sends mail catches its own failures and swallows them, on purpose — losing
 * an enquiry because a mail server was down would be worse than not being
 * notified. The cost is that a misconfiguration is invisible from the front
 * end. This is the one place that reports the error instead of hiding it.
 *
 * Nothing here writes to the database.
 */

/**
 * Turns Gmail's terse SMTP error into something actionable.
 *
 * Google answers almost every credential problem with the same sentence —
 * "Username and Password not accepted" — whether the password is wrong, is
 * an account password rather than an app password, or 2-Step Verification
 * was never switched on. The distinctions matter and the error does not draw
 * them, so they are drawn here.
 */
function explain(err: any): string {
  const msg = String(err?.message ?? err)
  const code = err?.code ?? err?.responseCode

  if (/application-specific password required/i.test(msg)) {
    return [
      'This is an ordinary account password. Gmail needs an app password.',
      'Turn on 2-Step Verification at myaccount.google.com/security, then',
      'create one at myaccount.google.com/apppasswords and use that instead.',
    ].join('\n  ')
  }
  if (code === 'EAUTH' || code === 535) {
    const pass = process.env.SMTP_PASS ?? ''
    const stripped = pass.replace(/\s+/g, '')
    const notes = [
      'Gmail rejected the username or password. The usual causes:',
      '  - SMTP_PASS is the account password, not a 16-character app password',
      '  - 2-Step Verification is off, so app passwords cannot be created',
      '  - the app password was revoked, or belongs to a different account',
      `  - SMTP_USER (${process.env.SMTP_USER}) is not the full address`,
    ]
    if (stripped && stripped.length !== 16) {
      notes.push(
        `  - SMTP_PASS is ${stripped.length} characters once spaces are removed;`,
        '    a Google app password is exactly 16',
      )
    }
    return notes.join('\n  ')
  }
  if (/5\.4\.5|daily (sending|user sending) quota|limit exceeded/i.test(msg)) {
    return [
      'The daily sending limit was reached. A free Gmail account allows about',
      '500 recipients a day, Google Workspace about 2,000. It resets after 24',
      'hours. Nothing is wrong with the configuration.',
    ].join('\n  ')
  }
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ESOCKET') {
    return [
      `Could not reach ${process.env.SMTP_HOST}:${process.env.SMTP_PORT ?? 587}.`,
      'Gmail is smtp.gmail.com on port 587. Some networks block outbound SMTP;',
      'if this works from another connection, that is the cause.',
    ].join('\n  ')
  }
  return msg
}

const run = async () => {
  const to = process.argv[2]

  console.log('Configuration')
  console.log('  SMTP_HOST  ', process.env.SMTP_HOST || '(unset — email is disabled)')
  console.log('  SMTP_PORT  ', process.env.SMTP_PORT || '587 (default)')
  console.log('  SMTP_USER  ', process.env.SMTP_USER || '(unset)')
  console.log('  SMTP_PASS  ', process.env.SMTP_PASS ? `set, ${process.env.SMTP_PASS.length} chars` : '(unset)')
  console.log('  EMAIL_FROM ', process.env.EMAIL_FROM || '(unset)')
  console.log('')

  if (!process.env.SMTP_HOST) {
    console.error('SMTP_HOST is unset, so Payload has no mail adapter and will')
    console.error('only write messages to this console. Fill it in and re-run.')
    process.exit(1)
  }

  // No check here for EMAIL_FROM differing from SMTP_USER: importing the
  // config above already prints that warning, and saying it twice in one
  // terminal reads like two separate problems.

  const payload = await getPayload({ config })

  let target = to
  if (!target) {
    const settings: any = await payload.findGlobal({ slug: 'site-settings' })
    target = settings?.contactEmail
    if (!target) {
      console.error('No address given and Site Settings has no contactEmail.')
      console.error('Either set one in the admin under Brand & SEO, or run:')
      console.error('  npm run email:test you@example.com')
      process.exit(1)
    }
    console.log(`Using contactEmail from Site Settings: ${target}`)
  }

  const stamp = new Date().toISOString()
  try {
    await payload.sendEmail({
      to: target,
      subject: `SmartMoney Express — test email (${stamp})`,
      text: [
        'This is a test from the SmartMoney Express site.',
        '',
        'If it reached you, three things now work:',
        '  - the contact form will notify you of new enquiries',
        '  - you will be told when a comment is waiting for approval',
        '  - admin password resets will arrive by email',
        '',
        `Sent ${stamp} from ${process.env.EMAIL_FROM} via ${process.env.SMTP_HOST}.`,
      ].join('\n'),
    })
    console.log('')
    console.log(`Sent to ${target}.`)
    console.log('Check the inbox, and the spam folder — mail a Gmail account')
    console.log('sends to itself sometimes lands there the first time.')
  } catch (err: any) {
    console.error('')
    console.error(`Could not send to ${target}.`)
    console.error('  ' + explain(err))
    console.error('')
    console.error('Raw error:', err?.message ?? err)
    process.exit(1)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
