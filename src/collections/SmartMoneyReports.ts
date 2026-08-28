import type { CollectionConfig } from 'payload'
import {
  chartsField,
  flowScore,
  heroFields,
  publishingFields,
  referencesField,
  sectionField,
  slugField,
} from '../fields/common'

export const SmartMoneyReports: CollectionConfig = {
  slug: 'smart-money-reports',
  labels: { singular: 'Smart Money Report', plural: 'Smart Money Reports' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'ticker', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description: 'Institutional and promoter activity in a single company.',
    livePreview: {
      url: ({ data }) => `/insight/${data?.slug}`,
    },
  },
  access: { read: () => true },
  versions: { drafts: { autosave: { interval: 800 } } },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    sectionField(),
    ...publishingFields(),

    {
      type: 'tabs',
      tabs: [
        {
          label: 'The company',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'stockName', type: 'text', required: true, admin: { width: '50%' } },
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
          label: 'Flow indicators',
          description:
            'Signed figures from -100 (heavy net selling) through 0 (flat) to +100 (heavy net buying). These describe observed activity. They are not ratings, scores out of ten, or recommendations, and the template labels them accordingly.',
          fields: [
            {
              name: 'flows',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    flowScore('fii', 'FII flow', 'Foreign institutional net direction.'),
                    flowScore('dii', 'DII flow', 'Domestic institutional net direction.'),
                    flowScore('promoter', 'Promoter flow', 'Promoter net direction.'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    flowScore('technical', 'Technical trend', 'Price/volume trend direction.'),
                    flowScore('fundamental', 'Fundamental trend', 'Earnings trend direction.'),
                  ],
                },
                {
                  name: 'asOf',
                  type: 'date',
                  label: 'Figures as of',
                  admin: {
                    date: { pickerAppearance: 'dayOnly' },
                    description: 'Shown next to the flow panel so readers know how fresh it is.',
                  },
                },
                {
                  name: 'basis',
                  type: 'text',
                  label: 'Measured over',
                  defaultValue: 'Trailing 4 weeks',
                  admin: { description: 'e.g. "Trailing 4 weeks", "Q2 FY26 shareholding".' },
                },
              ],
            },
          ],
        },

        {
          label: 'The write-up',
          fields: [
            ...heroFields(),
            {
              name: 'aiSummary',
              type: 'textarea',
              label: 'Summary',
              maxLength: 700,
              admin: {
                description:
                  'Three or four sentences a reader could take away on their own. Plain language, no calls.',
              },
            },
            { name: 'body', type: 'richText', required: true },
            chartsField(),
            referencesField(),
          ],
        },
      ],
    },
  ],
}
