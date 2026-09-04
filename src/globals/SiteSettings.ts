import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

/**
 * Everything the owner might want to reword without a developer.
 * Keep adding here rather than hard-coding copy into components.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Homepage',
          fields: [
            {
              name: 'philosophyEyebrow',
              type: 'text',
              defaultValue: 'How to read this site',
            },
            {
              name: 'philosophyHeading',
              type: 'textarea',
              required: true,
              maxLength: 180,
              defaultValue:
                'We track where large investors actually put their money, and explain why in plain English.',
            },
            {
              name: 'philosophyBody',
              type: 'textarea',
              maxLength: 500,
              defaultValue:
                'No tips, no target prices, no calls. Foreign institutions, domestic funds and promoters leave a paper trail every week. We read it, check it, and write up what changed — so you can form your own view in ten minutes rather than an afternoon.',
            },
            {
              name: 'flowTapeHeading',
              type: 'text',
              defaultValue: 'Latest institutional activity',
            },
            {
              name: 'showAiSearchPlaceholder',
              type: 'checkbox',
              defaultValue: true,
              label: 'Reserve space for AI search',
              admin: {
                description:
                  'Shows the styled, non-functional search slot on the homepage. Wired up in Phase 2.',
              },
            },
          ],
        },
        {
          label: 'Newsletter',
          fields: [
            { name: 'newsletterHeading', type: 'text', defaultValue: 'The Weekly Capital Flow Report' },
            {
              name: 'newsletterBody',
              type: 'textarea',
              maxLength: 300,
              defaultValue:
                'One email each Sunday. What the institutions bought and sold, what changed in the macro picture, and which themes are drawing capital. Free.',
            },
            { name: 'newsletterCta', type: 'text', defaultValue: 'Subscribe' },
            {
              name: 'newsletterFinePrint',
              type: 'text',
              defaultValue: 'No spam. Unsubscribe in one click.',
            },
            {
              name: 'exitIntentEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Show the exit-intent signup',
            },
          ],
        },
        {
          label: 'Legal',
          description:
            'This copy appears on every article and in the footer. Have it reviewed before launch.',
          fields: [
            {
              name: 'articleDisclaimer',
              type: 'textarea',
              required: true,
              defaultValue:
                'Capital Compass publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.',
            },
            {
              name: 'flowIndicatorExplainer',
              type: 'textarea',
              required: true,
              defaultValue:
                'Flow indicators run from -100 to +100 and show net direction of activity over the stated period. A positive figure means net buying was observed. It is not a score, a rating, or a forecast.',
            },
            { name: 'footerLegalName', type: 'text', defaultValue: 'Capital Compass' },
          ],
        },
        {
          label: 'Brand & SEO',
          fields: [
            { name: 'siteName', type: 'text', required: true, defaultValue: 'Capital Compass' },
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'Where the money actually went',
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              maxLength: 200,
              defaultValue:
                'Institutional flow analysis for HNI and NRI investors. Foreign and domestic fund activity, promoter moves, macro and sector themes — explained plainly.',
            },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
            { name: 'contactEmail', type: 'email' },
          ],
        },
      ],
    },
  ],
}
