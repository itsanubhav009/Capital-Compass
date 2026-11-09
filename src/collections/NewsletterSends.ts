import type { CollectionConfig } from 'payload'

/**
 * One row per time an article was emailed to the list.
 *
 * Kept as its own collection rather than an array on the article, because a
 * send is an event with its own time, its own author and its own outcome per
 * recipient. Hanging that off the article would grow the article document
 * every time it was sent and make the editing form slower for no benefit.
 *
 * Every field is read-only and nothing here is writable through the admin.
 * The rows are a record of what happened; editing them would only ever make
 * that record wrong. They are written by /api/newsletter/send with
 * overrideAccess.
 */
export const NewsletterSends: CollectionConfig = {
  slug: 'newsletter-sends',
  labels: { singular: 'Newsletter send', plural: 'Newsletter sends' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'article', 'delivered', 'failed', 'sentAt'],
    description:
      'Every time an article was emailed to subscribers, and what happened to each address. Written automatically — nothing here can be edited.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    // Deletable: an old log is the editor's to clear out if they want to.
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-sentAt',
  timestamps: true,
  fields: [
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true, description: 'A one-line description of this send.' },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      admin: { readOnly: true },
    },
    {
      name: 'articleTitle',
      type: 'text',
      // Copied rather than read through the relationship, so the log still
      // reads correctly after the article is renamed or deleted.
      admin: { readOnly: true, description: 'The title at the time it was sent.' },
    },
    { name: 'sentAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'provider',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'What carried the mail. Resend reports back what happened to each copy; Gmail does not.',
      },
    },
    {
      name: 'sentBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Who pressed the button.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'delivered',
          type: 'number',
          label: 'Accepted',
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'failed',
          type: 'number',
          label: 'Not sent',
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'total',
          type: 'number',
          label: 'Addresses tried',
          admin: { readOnly: true, width: '34%' },
        },
      ],
    },
    {
      name: 'recipients',
      type: 'array',
      label: 'Every address',
      labels: { singular: 'Address', plural: 'Addresses' },
      admin: {
        readOnly: true,
        description:
          'What happened to each address. Sent through Resend, each row is updated as the receiving server reports back — delivered, bounced, marked as spam, opened, clicked. Sent through Gmail, "Accepted" is the last thing known.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'text', admin: { readOnly: true, width: '45%' } },
            {
              name: 'status',
              type: 'select',
              options: [
                { label: 'Accepted by the mail server', value: 'delivered' },
                { label: 'Not sent', value: 'failed' },
              ],
              admin: { readOnly: true, width: '20%' },
            },
            {
              name: 'error',
              type: 'text',
              label: 'Why not',
              admin: { readOnly: true, width: '35%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            // Resend's id for this copy. Its webhooks name the copy by it,
            // which is how a "bounced" finds its way back to this row.
            { name: 'resendId', type: 'text', admin: { readOnly: true, width: '30%' } },
            {
              // The furthest it got: sent, delivered, opened, clicked — or
              // bounced, complained (marked as spam), delayed. Plain text,
              // not a select, so a new event type from Resend is recorded
              // rather than rejected.
              name: 'lastEvent',
              type: 'text',
              admin: { readOnly: true, width: '20%' },
            },
            { name: 'openedAt', type: 'date', admin: { readOnly: true, width: '25%' } },
            { name: 'clickedAt', type: 'date', admin: { readOnly: true, width: '25%' } },
          ],
        },
        {
          // Primary, Promotions, Updates, Social or Spam. Known only for the
          // seed inboxes this site can sign in to; Gmail tells no sender
          // which tab a stranger's copy went to.
          name: 'placement',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
  ],
}
