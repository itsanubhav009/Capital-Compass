import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'

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
       max: process.env.VERCEL ? 1 : 10,
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
            collections: { media: true },
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

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,

  upload: { limits: { fileSize: 8_000_000 } },

  cors: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
})
