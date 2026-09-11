import type { CollectionConfig } from 'payload'
import { revalidateComment, revalidateCommentOnDelete } from '../hooks/revalidate'

/**
 * Reader comments on articles.
 *
 * Written by the server route at /api/comments with overrideAccess, so the
 * public form works without the collection being open to anonymous writes.
 *
 * Nothing appears on the site until Approved is ticked. On a publication that
 * writes about named companies, an unmoderated comment box is a defamation
 * surface, so approval is the default rather than an option.
 *
 * The article is recorded by slug rather than by relationship: comments span
 * four content collections, and a slug is what the article page already has
 * in hand when it renders.
 */
export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'Comment', plural: 'Comments' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'articleTitle', 'approved', 'createdAt'],
    description:
      'Comments left by readers at the bottom of articles. Nothing shows on the site until you tick Approved.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    // Approving or deleting one changes what the article page shows, so the
    // cached page has to go.
    afterChange: [revalidateComment],
    afterDelete: [revalidateCommentOnDelete],
  },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Shown next to the comment.' },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Never published. Used only if you need to reply or verify who wrote this.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: 'Comment',
    },
    {
      name: 'articleSlug',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true, description: 'The article this was left on.' },
    },
    {
      name: 'articleTitle',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'articleCollection',
      type: 'text',
      admin: { readOnly: true, description: 'Which content type the article belongs to.' },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      label: 'Approved',
      admin: {
        position: 'sidebar',
        description: 'Tick to publish this comment on the article.',
      },
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
