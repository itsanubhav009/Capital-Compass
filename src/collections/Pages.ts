import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/common'

/**
 * Static pages: About, Contact intro, Disclaimer, Privacy, Terms,
 * Editorial standards. Anything that isn't dated editorial content.
 *
 * These render through src/app/(frontend)/[slug]/page.tsx, which tries a
 * section first and falls back to a page. So a page slug must not collide
 * with a section slug — the section wins.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt', '_status'],
    group: 'Content',
    description: 'About, Contact, and the legal pages linked in the footer.',
    livePreview: { url: ({ data }) => `/${data?.slug}` },
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: { autosave: { interval: 800 } } },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'standfirst',
      type: 'textarea',
      maxLength: 240,
      admin: { description: 'One or two sentences under the heading. Also used as the meta description.' },
    },
    { name: 'body', type: 'richText', required: true },
    {
      name: 'lastReviewed',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description: 'Shown at the foot of legal pages. Update when the text changes.',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Hide from search engines',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
