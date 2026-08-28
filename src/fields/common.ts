import type { Field, FieldHook } from 'payload'

/** Slugify on save so the client never types a URL by hand. */
const formatSlug: FieldHook = ({ data, operation, originalDoc, value }) => {
  if (typeof value === 'string' && value.length) return slugify(value)
  if (operation === 'create' || !originalDoc?.slug) {
    const fallback = data?.title
    if (typeof fallback === 'string' && fallback.length) return slugify(fallback)
  }
  return value
}

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Leave blank and this fills itself in from the title.',
  },
  hooks: { beforeValidate: [formatSlug] },
})

/**
 * Section is the spine of the site. Navigation is driven by this taxonomy,
 * NOT by post type — that is what lets "Smart Money Insights" pull from
 * several post types at once, and "Capital Flow – International" pull from two.
 * Every content collection includes this field.
 */
export const sectionField = (): Field => ({
  name: 'section',
  type: 'relationship',
  relationTo: 'sections',
  required: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Which menu section this appears under.',
  },
})

export const publishingFields = (): Field[] => [
  {
    name: 'publishedAt',
    type: 'date',
    index: true,
    defaultValue: () => new Date().toISOString(),
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'featured',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Show this in Featured Insights on the homepage.',
    },
  },
  {
    name: 'readingMinutes',
    type: 'number',
    min: 1,
    admin: { position: 'sidebar', description: 'Optional. Shown as "6 min read".' },
  },
]

export const heroFields = (): Field[] => [
  {
    name: 'standfirst',
    type: 'textarea',
    maxLength: 240,
    admin: {
      description:
        'One or two sentences under the headline. This is also what shows on cards and in Google results.',
    },
  },
  {
    name: 'featuredImage',
    type: 'upload',
    relationTo: 'media',
    admin: { description: 'Landscape, at least 1600px wide.' },
  },
]

/**
 * Flow indicators.
 *
 * Deliberately signed (-100 outflow … +100 inflow) rather than a 0–10 rating.
 * A rating next to a ticker reads as a recommendation, which the brief
 * forbids. A signed net-direction figure is a description of observed
 * activity, which it is not. Do not change this to an unsigned scale
 * without legal sign-off.
 */
export const flowScore = (name: string, label: string, help: string): Field => ({
  name,
  type: 'number',
  min: -100,
  max: 100,
  admin: {
    width: '33%',
    step: 1,
    description: help,
  },
  label,
})

export const referencesField = (): Field => ({
  name: 'references',
  type: 'array',
  labels: { singular: 'Source', plural: 'Sources' },
  admin: {
    description: 'Where the numbers came from. Shown at the foot of the article.',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text' },
    {
      name: 'publishedOn',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
  ],
})

export const chartsField = (): Field => ({
  name: 'charts',
  type: 'array',
  labels: { singular: 'Chart', plural: 'Charts' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    { name: 'source', type: 'text' },
  ],
})
