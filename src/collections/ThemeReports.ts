import type { CollectionConfig } from 'payload'
import {
  chartsField,
  heroFields,
  publishingFields,
  referencesField,
  sectionField,
  slugField,
} from '../fields/common'
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'

export const ThemeReports: CollectionConfig = {
  slug: 'theme-reports',
  labels: { singular: 'Theme Report', plural: 'Theme Reports' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'theme', 'capitalFlowTrend', 'publishedAt', '_status'],
    group: 'Content',
    description: 'Where capital is rotating: AI, defence, renewables, data centres.',
    livePreview: { url: ({ data }) => `/insight/${data?.slug}` },
  },
  hooks: {
    afterChange: [indexOnChange],
    afterDelete: [deindexOnDelete],
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
          name: 'theme',
          type: 'relationship',
          relationTo: 'themes',
          required: true,
          admin: { width: '50%' },
        },
        { name: 'industry', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'capitalFlowTrend',
      type: 'select',
      required: true,
      defaultValue: 'steady',
      options: [
        { label: 'Accelerating', value: 'accelerating' },
        { label: 'Steady', value: 'steady' },
        { label: 'Cooling', value: 'cooling' },
        { label: 'Reversing', value: 'reversing' },
      ],
      admin: { description: 'Drives the trend marker on the Sector Themes module.' },
    },
    ...heroFields(),
    {
      name: 'keyStocks',
      type: 'array',
      labels: { singular: 'Company', plural: 'Companies mentioned' },
      admin: {
        description:
          'Companies discussed in the piece. Listing a company is not a recommendation and the template says so.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'ticker', type: 'text', admin: { width: '25%' } },
            { name: 'note', type: 'text', admin: { width: '25%' } },
          ],
        },
      ],
    },
    { name: 'outlook', type: 'richText', required: true, label: 'Outlook' },
    chartsField(),
    referencesField(),
  ],
}
