import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { EXPERIMENTAL_TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Articles } from './collections/Articles'
import { Sections, Sectors, Themes } from './collections/Taxonomies'
import { SmartMoneyReports } from './collections/SmartMoneyReports'
import { MacroNotes } from './collections/MacroNotes'
import { ThemeReports } from './collections/ThemeReports'
import { WealthArticles } from './collections/WealthArticles'
import { Pages } from './collections/Pages'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Subscribers } from './collections/Subscribers'
import { Comments } from './collections/Comments'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * What the public site reads from.
 *
 * One entry now. The four old collections were copied into Articles and
 * dropped from this list, which is what takes them off the site. Their rows
 * are deliberately still in the database and their definitions still
 * registered — hidden from the sidebar, not deleted — so this is reversible
 * until someone decides otherwise.
 */
export const CONTENT_COLLECTIONS = ['articles'] as const

// Media goes to object storage only when a bucket is configured. Local dev
// keeps writing to disk, which is fine because that disk survives a restart.
// On Vercel it does not, so S3_BUCKET must be set in production.
const useS3 = Boolean(process.env.S3_BUCKET)

// Enabling S3 without a public URL yields image src values of
// "undefined/filename.webp", which fails silently in the browser.
if (useS3 && !process.env.S3_PUBLIC_URL) {
  throw new Error('S3_BUCKET is set but S3_PUBLIC_URL is missing')
}
/**
 * Email is on only when a host is named. Without it Payload falls back to
 * writing messages to the server log, which is right for local work and
 * quietly wrong in production — a contact enquiry or a password reset would
 * vanish into Vercel's logs with nothing to show for it. Hence the warning
 * below rather than silence.
 */
const useEmail = Boolean(process.env.SMTP_HOST)

if (useEmail && !process.env.EMAIL_FROM) {
  // Providers reject mail from an address they have not verified, so an
  // unset From is a guaranteed bounce. Better to fail at boot than on the
  // first enquiry.
  throw new Error('SMTP_HOST is set but EMAIL_FROM is missing')
}

if (useEmail && process.env.EMAIL_FROM !== process.env.SMTP_USER) {
  // Gmail will not let an arbitrary address through: it silently rewrites
  // the From header to the account that authenticated, so the mail still
  // arrives but not from who you intended. Worth saying out loud, because
  // nothing in the delivered message reveals the substitution.
  console.warn(
    `[email] EMAIL_FROM (${process.env.EMAIL_FROM}) differs from SMTP_USER ` +
      `(${process.env.SMTP_USER}). Gmail will send as SMTP_USER unless that ` +
      'address is a verified alias under Gmail Settings → Accounts.',
  )
}

if (!useEmail && process.env.NODE_ENV === 'production') {
  console.warn(
    '[email] SMTP_HOST is unset — contact notifications and password resets ' +
      'will be written to the log instead of sent. See README: Email.',
  )
}

const vercelHost = (v?: string) => (v ? `https://${v}` : '')

const allowedOrigins = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_SITE_URL || '',
      vercelHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
      vercelHost(process.env.VERCEL_URL),
      vercelHost(process.env.VERCEL_BRANCH_URL),
      ...(process.env.ADDITIONAL_ORIGINS ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ]
      .filter(Boolean)
      .map((o) => o.replace(/\/$/, '')),
  ),
)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Sidebar order. Payload lists groups in the order their collections are
    // registered, so this is set by the `collections` array below rather than
    // here — the grouping is: Content, Library, Taxonomy, Inbox, Settings.
    meta: { titleSuffix: ' · SmartMoney' },
    // Component paths above are resolved from here. Without it they resolve
    // from the project root and the generated import map cannot find them.
    importMap: { baseDir: path.resolve(dirname) },
    // Shared by every collection's Live Preview tab, so the device sizes match
    // the breakpoints the site is actually built against.
    livePreview: {
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { name: 'laptop', label: 'Laptop', width: 1366, height: 800 },
        { name: 'desktop', label: 'Desktop', width: 1580, height: 900 },
      ],
    },
  },

  collections: [
    // Content
    Articles,
    SmartMoneyReports,
    MacroNotes,
    ThemeReports,
    WealthArticles,
    Pages,
    // Library
    Media,
    // Taxonomy
    Sections,
    Sectors,
    Themes,
    // Inbox
    ContactSubmissions,
    Subscribers,
    Comments,
    // Settings
    Users,
  ],

  globals: [SiteSettings],

  /**
   * Tables.
   *
   * The default feature set has no table node, so a table pasted from a
   * document or a spreadsheet was flattened into loose paragraphs on the way
   * in — the rows survived as text, the grid did not. Adding the feature
   * registers the node, which both puts a table control in the toolbar and
   * lets a pasted table keep its shape. The front end already knew how to
   * draw one: the RichText renderer ships a table converter and was simply
   * never handed any tables.
   *
   * Payload still marks this experimental, hence the name. It only affects
   * content written from here on; anything already flattened stays flat and
   * has to be pasted again.
   */
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),

  db: postgresAdapter({
    pool: {
       connectionString: process.env.DATABASE_URI || '',
       max: process.env.VERCEL ? 5 : 10,
       connectionTimeoutMillis: 30_000,
    },
    // Migrations are the source of truth now, so skip schema introspection
    // on boot. This is what was causing the endless "Pulling schema" spinner.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  plugins: [
    seoPlugin({
      collections: [...CONTENT_COLLECTIONS, 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title} · SmartMoney`,
      generateDescription: ({ doc }) =>
        doc?.standfirst || doc?.summary || '',
      generateURL: ({ doc, collectionSlug }) =>
        collectionSlug === 'pages'
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/${doc?.slug}`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/insight/${doc?.slug}`,
      tabbedUI: true,
    }),

    ...(useS3
      ? [
          s3Storage({
            collections: {
              // Serve directly from R2's public hostname rather than proxying
              // through the app. Without generateFileURL, Payload returns
              // /api/media/file/... and every image view costs a serverless
              // invocation plus Vercel bandwidth.
              media: {
                generateFileURL: ({ filename }: { filename: string }) =>
                  `${process.env.S3_PUBLIC_URL}/${filename}`,
              },
            },
            bucket: process.env.S3_BUCKET as string,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'auto',
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
              // Required for R2, Backblaze and most non-AWS S3 services.
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],


  // Without this, password reset silently writes to the server log instead of
  // sending. Enabled only when SMTP credentials are present, so local
  // development keeps logging to console.
  ...(useEmail
    ? {
        email: nodemailerAdapter({
          // Guaranteed present: the boot check above refuses to start without it.
          defaultFromAddress: process.env.EMAIL_FROM!,
          defaultFromName: 'SmartMoney Express',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              // Google presents an app password as four space-separated
              // groups ("abcd efgh ijkl mnop"). Pasted exactly as shown it
              // fails authentication, with an error that says only that the
              // password was not accepted — so the spaces come out here.
              pass: process.env.SMTP_PASS?.replace(/\s+/g, ''),
            },
          },
        }),
      }
    : {}),

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,

  upload: { limits: { fileSize: 8_000_000 } },

  // Every hostname the app is actually served on.
  //
  // Payload only honours cookie auth when the request Origin is on this list,
  // so a host that is missing makes every admin write — including every
  // autosave and every image upload — fail with "You are not allowed to
  // perform this action". That is not a permissions problem and no amount of
  // access-control reading finds it.
  //
  // NEXT_PUBLIC_SITE_URL alone is not enough: a Vercel project answers on its
  // production alias, its per-deployment hostname and its branch hostname,
  // and NEXT_PUBLIC_SITE_URL can only name one of them.
  // VERCEL_PROJECT_PRODUCTION_URL is the canonical production alias, which is
  // the one an editor actually types. ADDITIONAL_ORIGINS covers custom domains
  // — comma-separated, each with its scheme.
  cors: allowedOrigins,
  csrf: allowedOrigins,
})
