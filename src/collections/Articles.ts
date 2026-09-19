import type { CollectionConfig } from 'payload'
import { previewOptions } from '../fields/preview'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { chartsField, heroFields, publishingFields, referencesField, sectionField, slugField } from '../fields/common'
import { viewsField } from './views-field'
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'

/**
 * Every piece of writing on the site.
 *
 * This replaces four near-identical collections — Smart Money Reports, Macro
 * Notes, Theme Reports and Wealth Articles. Three of them had stopped
 * carrying anything the others did not, and no rule told an editor which to
 * pick. The Section decides where a piece belongs; the Front page group
 * decides where it shows. Fields only some pieces need live under Extras,
 * collapsed, so the everyday form is short.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'publishedAt', '_status'],
    group: 'Content',
    description:
      'Everything you write. Pick a Section to say where it belongs, then tick where it should appear on the front page.',
    ...previewOptions('articles'),
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

    /**
     * Where this shows on the front page.
     *
     * Every box starts ticked. Placement used to follow from the section and
     * the date alone; if these arrived empty, a newly published piece would
     * appear nowhere and fail silently. So they are an override on top of the
     * existing behaviour, not a replacement for it — untick to hold a piece
     * back from one block without unpublishing it.
     */
    {
      name: 'placement',
      type: 'group',
      label: 'Show on the front page',
      admin: {
        position: 'sidebar',
        description: 'All ticked by default. Untick to keep this out of a block.',
      },
      fields: [
        {
          name: 'hero',
          type: 'checkbox',
          label: 'Hero carousel',
          defaultValue: true,
          admin: { description: 'The big story at the top. Three most recent of those ticked.' },
        },
        {
          name: 'rails',
          type: 'checkbox',
          label: 'Hero side rails',
          defaultValue: true,
          admin: { description: 'The columns either side. India and International pieces only.' },
        },
        {
          name: 'latest',
          type: 'checkbox',
          label: 'Latest Stories',
          defaultValue: true,
          admin: { description: 'The block over the photograph.' },
        },
        {
          name: 'sectionBand',
          type: 'checkbox',
          label: "Its section's own block",
          defaultValue: true,
          admin: { description: 'The Insights band or the Global Macro block, whichever fits.' },
        },
        {
          name: 'sectorThemes',
          type: 'checkbox',
          label: 'Sector Themes',
          defaultValue: true,
          admin: { description: 'Only appears if a Theme is set under Extras.' },
        },
      ],
    },

    ...heroFields(),
    {
      // Sits directly under Main image, which is the only place anyone wants
      // it. Collapsed to a single link until clicked.
      name: 'addImageFromUrl',
      type: 'ui',
      admin: { components: { Field: '/admin/AddImageFromUrl#default' } },
    },
    { name: 'body', type: 'richText', required: true },

    /**
     * The fields the four old types had between them. Collapsed, because most
     * pieces need none of them, and an empty accordion costs nothing while a
     * screenful of unused inputs costs attention on every article.
     */
    {
      type: 'collapsible',
      label: 'Extras — only if this piece needs them',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'region',
              type: 'select',
              admin: { width: '50%', description: 'Macro pieces.' },
              options: ['India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global'],
            },
            {
              name: 'assetClass',
              type: 'select',
              label: 'What it is about',
              admin: { width: '50%', description: 'Macro pieces.' },
              options: ['Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset'],
            },
          ],
        },
        {
          name: 'impact',
          type: 'select',
          label: 'Impact marker',
          options: [
            { label: 'Supportive for Indian assets', value: 'positive' },
            { label: 'Broadly neutral', value: 'neutral' },
            { label: 'A headwind for Indian assets', value: 'negative' },
          ],
          admin: {
            description: 'Shows a coloured marker on the article. Leave blank for no marker.',
          },
        },
        {
          name: 'impactNote',
          type: 'text',
          label: 'One-line reason',
          admin: { description: 'Sits next to the marker.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'theme',
              type: 'relationship',
              relationTo: 'themes',
              admin: { width: '50%', description: 'Required for Sector Themes.' },
            },
            {
              name: 'industry',
              type: 'text',
              admin: { width: '50%', description: 'Optional narrower label, e.g. "Semiconductors".' },
            },
          ],
        },
        {
          name: 'capitalFlowTrend',
          type: 'select',
          label: 'Where the money is going',
          options: [
            { label: 'Accelerating', value: 'accelerating' },
            { label: 'Steady', value: 'steady' },
            { label: 'Cooling', value: 'cooling' },
            { label: 'Reversing', value: 'reversing' },
          ],
        },
        {
          name: 'keyStocks',
          type: 'array',
          label: 'Companies to watch',
          labels: { singular: 'Company', plural: 'Companies mentioned' },
          admin: {
            description:
              'Companies discussed in the piece. Listing one is not a recommendation and the template says so.',
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
        {
          name: 'tags',
          type: 'text',
          hasMany: true,
          admin: {
            description:
              'Optional keywords for your own filtering. Type one and press Enter. Not shown to readers.',
          },
        },
        referencesField(),
        chartsField(),
      ],
    },

    viewsField(),
  ],
}
