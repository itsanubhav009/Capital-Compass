import type { CollectionConfig } from 'payload'
import { previewOptions } from '../fields/preview'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import {
  chartsField,
  heroFields,
  publishingFields,
  referencesField,
  sectionField,
  slugField,
} from '../fields/common'
import { viewsField } from './views-field'
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'

export const ThemeReports: CollectionConfig = {
  slug: 'theme-reports',
  labels: { singular: 'Theme Report', plural: 'Theme Reports' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'theme', 'capitalFlowTrend', 'publishedAt', '_status'],
    group: 'Content',
    description: 'Where money is moving as a subject rather than a company: AI, defence, renewables, data centres. These are the only pieces that feed the Sector Themes row.',
    ...previewOptions('theme-reports'),
  },
  hooks: {
    afterChange: [indexOnChange, revalidateAfterChange],
    afterDelete: [deindexOnDelete, revalidateAfterDelete],
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
    viewsField(),
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
        {
          name: 'industry',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Optional narrower label, e.g. "Semiconductors" inside the AI theme.',
          },
        },
      ],
    },
    {
      name: 'capitalFlowTrend',
      type: 'select',
      label: 'Where the money is going',
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
      label: 'Companies to watch',
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
