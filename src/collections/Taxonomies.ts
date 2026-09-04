import type { CollectionConfig } from 'payload'
import {
  revalidateEverything,
  revalidateEverythingOnDelete,
} from '../hooks/revalidate'
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
    group: 'Taxonomy',
    description:
      'The site menu, top to bottom. Lower Nav order comes first. Two sections sharing a prefix before a dash — "Capital Flow – India" and "Capital Flow – International" — collapse into one menu item with a dropdown.',
  },
  hooks: {
    afterChange: [revalidateEverything],
    afterDelete: [revalidateEverythingOnDelete],
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
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Taxonomy',
    description: 'Industry labels for Smart Money Reports — Banking, IT, Pharma and so on.',
  },
  hooks: {
    afterChange: [revalidateEverything],
    afterDelete: [revalidateEverythingOnDelete],
  },
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
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Taxonomy',
    description:
      'Cross-cutting subjects: AI, Defence, Renewable Energy, Infrastructure. These become the topic rail in the menu bar and the tiles in Explore Categories, so a theme with no published pieces behind it is hidden automatically.',
  },
  hooks: {
    afterChange: [revalidateEverything],
    afterDelete: [revalidateEverythingOnDelete],
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
