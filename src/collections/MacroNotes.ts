import type { CollectionConfig } from 'payload'
import {
  chartsField,
  heroFields,
  publishingFields,
  referencesField,
  sectionField,
  slugField,
} from '../fields/common'

export const MacroNotes: CollectionConfig = {
  slug: 'macro-notes',
  labels: { singular: 'Macro Note', plural: 'Macro Notes' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'region', 'assetClass', 'publishedAt', '_status'],
    group: 'Content',
    description: 'Rates, currencies, commodities and the macro backdrop.',
    livePreview: { url: ({ data }) => `/insight/${data?.slug}` },
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: { autosave: { interval: 800 } } },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    sectionField(),
    ...publishingFields(),
    {
      type: 'row',
      fields: [
        {
          name: 'region',
          type: 'select',
          required: true,
          admin: { width: '50%' },
          options: ['India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global'],
        },
        {
          name: 'assetClass',
          type: 'select',
          required: true,
          admin: { width: '50%' },
          options: ['Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset'],
        },
      ],
    },
    {
      name: 'impact',
      type: 'select',
      required: true,
      defaultValue: 'neutral',
      options: [
        { label: 'Supportive for Indian assets', value: 'positive' },
        { label: 'Broadly neutral', value: 'neutral' },
        { label: 'A headwind for Indian assets', value: 'negative' },
      ],
      admin: { description: 'Drives the direction marker on the Macro Snapshot module.' },
    },
    {
      name: 'impactNote',
      type: 'text',
      maxLength: 120,
      admin: { description: 'One line explaining the marker. Shown on the homepage.' },
    },
    ...heroFields(),
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 700,
      admin: { description: 'What happened, in three or four sentences.' },
    },
    { name: 'commentary', type: 'richText', required: true, label: 'Commentary' },
    chartsField(),
    referencesField(),
  ],
}
