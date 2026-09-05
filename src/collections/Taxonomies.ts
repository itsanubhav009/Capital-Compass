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
    group: 'Menu & Labels',
    description:
      'The links across the top of the site. Every article belongs to exactly one, and that is how readers find it. Lower Menu position sits further left. Two sections that share a prefix before a dash — "Capital Flow – India" and "Capital Flow – International" — become one menu link with a dropdown.',
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
      label: 'Section intro',
      maxLength: 200,
      admin: {
        description: 'One or two sentences under the heading on the section page. Optional.',
      },
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
      admin: { description: 'Colour tag on cards from this section.' },
    },
    {
      name: 'navOrder',
      label: 'Menu position',
      type: 'number',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers sit further left in the menu. 10, 20, 30 leaves room to insert.',
      },
    },
    {
      name: 'showInNav',
      label: 'Show in the menu',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Untick to hide the section from the menu. Its articles stay published.',
      },
    },
  ],
}

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Menu & Labels',
    description:
      'Industry labels for the companies you write about in Smart Money Reports — Banking, IT, Pharma. Used for filing, not shown as its own page.',
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
    group: 'Menu & Labels',
    description:
      'Subjects that cut across the report types: AI, Defence, Renewable Energy, Infrastructure. Each becomes a tile in the Explore Categories row and a link in the strip beside the menu. A theme with nothing published behind it hides itself, so adding one early does no harm.',
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
