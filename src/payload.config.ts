import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { Sections, Sectors, Themes } from './collections/Taxonomies'
import { SmartMoneyReports } from './collections/SmartMoneyReports'
import { MacroNotes } from './collections/MacroNotes'
import { ThemeReports } from './collections/ThemeReports'
import { WealthArticles } from './collections/WealthArticles'
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

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' · Capital Compass',
    },
    components: {},
  },

  collections: [
    SmartMoneyReports,
    MacroNotes,
    ThemeReports,
    WealthArticles,
    Sections,
    Sectors,
    Themes,
    Media,
    Users,
  ],

  globals: [SiteSettings],

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),

  plugins: [
    seoPlugin({
      collections: [...CONTENT_COLLECTIONS],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title} · Capital Compass`,
      generateDescription: ({ doc }) => doc?.standfirst || doc?.summary || doc?.aiSummary || '',
      generateURL: ({ doc }) => `${process.env.NEXT_PUBLIC_SITE_URL}/insight/${doc?.slug}`,
      tabbedUI: true,
    }),
  ],

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,

  // Uploads land on local disk by default. Switch to @payloadcms/storage-s3
  // before launch if you deploy anywhere with an ephemeral filesystem.
  upload: { limits: { fileSize: 8_000_000 } },

  cors: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
})
