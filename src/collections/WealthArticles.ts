import type { CollectionConfig } from 'payload'
import { previewOptions } from '../fields/preview'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import {
  heroFields,
  publishingFields,
  referencesField,
  sectionField,
  slugField,
} from '../fields/common'
import { viewsField } from './views-field'
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'

export const WealthArticles: CollectionConfig = {
  slug: 'wealth-articles',
  labels: { singular: 'Wealth Article', plural: 'Wealth Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description: 'Everything that is not tied to one company or one number: explainers, NRI topics, long reads.',
    ...previewOptions('wealth-articles'),
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
    ...heroFields(),
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description:
          'Optional keywords. Type one and press Enter, then the next. These are for your own filtering — they do not appear on the site.',
      },
    },
    { name: 'body', type: 'richText', required: true },
    referencesField(),
  ],
}
