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
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'

export const WealthArticles: CollectionConfig = {
  slug: 'wealth-articles',
  labels: { singular: 'Wealth Article', plural: 'Wealth Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description: 'General editorial: explainers, NRI topics, long reads.',
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
    ...heroFields(),
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Press Enter after each tag.' },
    },
    { name: 'body', type: 'richText', required: true },
    referencesField(),
  ],
}
