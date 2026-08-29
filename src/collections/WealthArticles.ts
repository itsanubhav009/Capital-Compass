import type { CollectionConfig } from 'payload'
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
