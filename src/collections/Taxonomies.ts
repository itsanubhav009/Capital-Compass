import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/common'

const anyoneCanRead = { read: () => true }

/**
 * Sections drive the main navigation. Seeded with the six labels from the
 * client's brief; the client can rename or reorder them without a developer,
 * which is the whole point of making this a collection rather than an enum.
 */
export const Sections: CollectionConfig = {
  slug: 'sections',
  labels: { singular: 'Section', plural: 'Sections' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'navOrder', 'showInNav'],
    group: 'Structure',
    description: 'The site menu. Reorder with Nav order.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: 'navOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'blurb',
      type: 'textarea',
      maxLength: 200,
      admin: { description: 'Sits under the heading on the section page.' },
    },
    {
      name: 'accent',
      type: 'select',
      defaultValue: 'deep',
      options: [
        { label: 'Bottle green', value: 'deep' },
        { label: 'Brass', value: 'brass' },
        { label: 'Inflow green', value: 'inflow' },
        { label: 'Outflow rust', value: 'outflow' },
        { label: 'Ink', value: 'ink' },
      ],
      admin: { description: 'Colour tag used on cards for this section.' },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  admin: { useAsTitle: 'title', group: 'Structure' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [{ name: 'title', type: 'text', required: true }, slugField()],
}

export const Themes: CollectionConfig = {
  slug: 'themes',
  admin: {
    useAsTitle: 'title',
    group: 'Structure',
    description: 'AI, Defence, Renewable Energy, Infrastructure, and so on.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'summary', type: 'textarea', maxLength: 200 },
  ],
}
