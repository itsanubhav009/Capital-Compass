# Analytics + email — apply these edits

## 1. `src/payload.config.ts`

Add the import at the top:

```ts
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
```

Add this next to the existing `useS3` line:

```ts
const useEmail = Boolean(process.env.SMTP_HOST)
```

Then add an `email` key inside `buildConfig({ ... })`, alongside `secret`:

```ts
  // Without this, password reset silently writes to the server log instead of
  // sending. Enabled only when SMTP credentials are present, so local
  // development keeps logging to console.
  ...(useEmail
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM || 'noreply@capitalcompass.com',
          defaultFromName: 'Capital Compass',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),
```

## 2. `src/app/(frontend)/layout.tsx`

Add the import:

```ts
import { Analytics, ConsentBanner } from '@/components/analytics'
```

Add both components just before the closing `</body>` tag, after the JSON-LD script:

```tsx
        <Analytics />
        <ConsentBanner />
```

Then add Search Console verification to the `generateMetadata` return, next to `robots`:

```ts
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
```

## 3. Install the email adapter

```bash
npm install @payloadcms/email-nodemailer@3.88.0
```

## 4. Environment variables

Add to `.env` and to Vercel (Production scope):

```
# Analytics — leave blank to disable analytics and the consent banner entirely
NEXT_PUBLIC_GA_ID=
GOOGLE_SITE_VERIFICATION=

# Email — Resend is the least setup. Sign up, verify a domain, create an API key.
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=
EMAIL_FROM=noreply@capitalcompass.com
```

`NEXT_PUBLIC_GA_ID` must be **Config**, not Secret — it is inlined into the browser
bundle by design. The `SMTP_*` values are Secrets.

## 5. Getting the values

**GA4 measurement ID** — analytics.google.com, create a property, add a Web data
stream for your domain. The ID looks like `G-XXXXXXXXXX`.

**Search Console verification** — search.google.com/search-console, add your domain
as a URL-prefix property, choose the HTML tag method, and copy only the `content`
value from the meta tag it shows you. Submit `https://yourdomain/sitemap.xml`
under Sitemaps once the site is live.

**Resend** — resend.com, add and verify your sending domain via DNS, then create
an API key. That key is the `SMTP_PASS`. The free tier covers 3,000 emails a
month, which is far more than password resets need.

## 6. Verify

```bash
npm run build
```

Then after deploying:

- Load the site in a private window. The consent banner should appear after
  about a second. Decline, reload, and confirm it stays gone.
- With consent accepted, check Realtime in the GA4 dashboard.
- Trigger a password reset from `/admin` and confirm the email arrives.
- View source and confirm the `google-site-verification` meta tag is present.
