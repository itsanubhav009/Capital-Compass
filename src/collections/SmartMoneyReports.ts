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

export const SmartMoneyReports: CollectionConfig = {
  slug: 'smart-money-reports',
  labels: { singular: 'Smart Money Report', plural: 'Smart Money Reports' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'ticker', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description:
      'One company at a time: who is buying, who is selling, and what the numbers say. These are the only pieces that feed the flow figures row on the homepage.',
    ...previewOptions('smart-money-reports'),
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
      type: 'tabs',
      tabs: [
        {
          label: 'The company',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'stockName',
                  type: 'text',
                  label: 'Company name',
                  required: true,
                  admin: { width: '50%', description: 'As readers know it, e.g. HDFC Bank.' },
                },
                {
                  name: 'ticker',
                  type: 'text',
                  admin: { width: '25%', placeholder: 'RELIANCE' },
                },
                {
                  name: 'exchange',
                  type: 'select',
                  defaultValue: 'NSE',
                  options: ['NSE', 'BSE', 'Both'],
                  admin: { width: '25%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sector',
                  type: 'relationship',
                  relationTo: 'sectors',
                  admin: { width: '50%' },
                },
                {
                  name: 'marketCapBand',
                  type: 'select',
                  options: ['Large cap', 'Mid cap', 'Small cap'],
                  admin: { width: '25%' },
                },
                {
                  name: 'marketCapCr',
                  type: 'number',
                  label: 'Market cap (₹ crore)',
                  min: 0,
                  admin: { width: '25%' },
                },
              ],
            },
          ],
        },

        {
          label: 'The write-up',
          fields: [
            ...heroFields(),
            { name: 'body', type: 'richText', required: true },
            chartsField(),
            referencesField(),
          ],
        },
      ],
    },
  ],
}
