import type { CollectionConfig } from 'payload'

/**
 * Contact form submissions.
 *
 * Created by the server route at /api/contact, which writes with
 * overrideAccess so the public form works without public write access.
 *
 * Create used to be denied outright. That was the only forbidden action
 * anywhere in the panel, and the admin still offers a "Create New" control
 * for it, so the one thing a signed-in user could do here was trigger
 * "You are not allowed to perform this action". Signed-in create is allowed
 * now — it was never a security boundary, since the fields are read-only and
 * an owner who wants a junk row can already make one by using the form.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'handled', 'createdAt'],
    group: 'Inbox',
    description:
      'Everything sent through the contact form on the site. Tick Handled once you have replied. Nothing here is public.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
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
