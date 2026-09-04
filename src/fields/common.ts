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
  label: 'Web address',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'The last part of the link, e.g. /insight/foreign-funds-in-august. Leave blank and it writes itself from the title. Changing it after publishing breaks any existing links.',
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
    description: 'Which menu section this appears under. Required — it decides where readers find it.',
  },
})

export const publishingFields = (): Field[] => [
  {
    name: 'publishedAt',
    type: 'date',
    label: 'Publish date',
    index: true,
    defaultValue: () => new Date().toISOString(),
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayAndTime' },
      description:
        'Orders the homepage — newest first. Defaults to now. This is a date shown to readers, not a schedule: it does not publish anything on its own.',
    },
  },
  {
    name: 'featured',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Adds it to Featured Insights on the homepage.',
    },
  },
  {
    name: 'readingMinutes',
    type: 'number',
    label: 'Reading time',
    min: 1,
    admin: {
      position: 'sidebar',
      description: 'Optional, in minutes. Shown to readers as "6 min read". Leave blank to hide it.',
    },
  },
]

export const heroFields = (): Field[] => [
  {
    name: 'standfirst',
    type: 'textarea',
    label: 'Summary line',
    maxLength: 240,
    admin: {
      description:
        'One or two sentences under the headline. Does triple duty: under the title, on homepage cards, and as the description in Google results. 240 characters maximum.',
    },
  },
  {
    name: 'featuredImage',
    type: 'upload',
    relationTo: 'media',
    label: 'Main image',
    admin: {
      description:
        'Landscape, at least 1600px wide. Used on the homepage, in the article and when the link is shared. Choose an existing image or upload a new one — every size is made for you.',
    },
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
    // Spelling out the scale on every one of these. A bare -100 to 100 box
    // gives no clue which end means buying, and the sign is the whole point.
    description: `${help} −100 heavy selling · 0 flat · +100 heavy buying. Leave blank if you have no read.`,
  },
  label,
})

export const referencesField = (): Field => ({
  name: 'references',
  type: 'array',
  labels: { singular: 'Source', plural: 'Sources' },
  admin: {
    description:
      'Where the numbers came from. Listed at the foot of the article. Add one row per source.',
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
