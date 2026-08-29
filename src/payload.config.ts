import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Sections, Sectors, Themes } from './collections/Taxonomies'
import { SmartMoneyReports } from './collections/SmartMoneyReports'
import { MacroNotes } from './collections/MacroNotes'
import { ThemeReports } from './collections/ThemeReports'
import { WealthArticles } from './collections/WealthArticles'
import { Pages } from './collections/Pages'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const CONTENT_COLLECTIONS = [
  'smart-money-reports',
  'macro-notes',
  'theme-reports',
  'wealth-articles',
] as const

// Media goes to object storage only when a bucket is configured. Local dev
// keeps writing to disk, which is fine because that disk survives a restart.
// On Vercel it does not, so S3_BUCKET must be set in production.
const useS3 = Boolean(process.env.S3_BUCKET)
const useEmail = Boolean(process.env.SMTP_HOST)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · Capital Compass' },
    components: {},
  },

  collections: [
    SmartMoneyReports,
    MacroNotes,
    ThemeReports,
    WealthArticles,
    Pages,
    ContactSubmissions,
    Sections,
    Sectors,
    Themes,
    Media,
    Users,
  ],

  globals: [SiteSettings],

  editor: lexicalEditor({}),

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
      generateTitle: ({ doc }) => `${doc?.title} · Capital Compass`,
      generateDescription: ({ doc }) =>
        doc?.standfirst || doc?.summary || doc?.aiSummary || '',
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

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,

  upload: { limits: { fileSize: 8_000_000 } },

  // VERCEL_URL is the per-deployment hostname. Without it, admin mutations
  // return 403 on preview deployments because the Origin header does not
  // match NEXT_PUBLIC_SITE_URL.
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean),
})
