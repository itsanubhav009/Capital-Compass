import type { CollectionConfig } from 'payload'

/**
 * Contact form submissions.
 *
 * Created only by the server route at /api/contact, never through the admin
 * panel — create/update are locked so a stray click can't fabricate an entry.
 * The owner reads and deletes.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'handled', 'createdAt'],
    group: 'Inbox',
    description: 'Messages sent through the contact form.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
    {
      name: 'topic',
      type: 'select',
      admin: { readOnly: true },
      options: [
        { label: 'General enquiry', value: 'general' },
        { label: 'Correction or factual dispute', value: 'correction' },
        { label: 'Media or partnership', value: 'media' },
        { label: 'Technical problem', value: 'technical' },
      ],
    },
    { name: 'subject', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Tick once you have replied.' },
    },
    {
      name: 'meta',
      type: 'group',
      admin: { position: 'sidebar', readOnly: true },
      fields: [
        { name: 'ip', type: 'text' },
        { name: 'userAgent', type: 'text' },
      ],
    },
  ],
}
