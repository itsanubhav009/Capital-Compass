import type { CollectionConfig } from 'payload'
import { revalidateEverything, revalidateEverythingOnDelete } from '../hooks/revalidate'

/**
 * Newsletter signups.
 *
 * Beehiiv was the only destination, so with no API key configured every
 * signup on the live site returned 503 and the address was lost. This is the
 * store of record instead: the route always writes here first, then forwards
 * to Beehiiv when it is configured. Nobody's address is dropped because a
 * third-party key is missing.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Subscriber', plural: 'Subscribers' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'forwarded', 'createdAt'],
    description:
      'Everyone who has signed up for the newsletter. Export from here, or connect Beehiiv to forward new signups automatically.',
  },
  access: {
    // The public form writes through /api/subscribe with overrideAccess, so
    // the collection itself stays closed to anonymous writes.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateEverything],
    afterDelete: [revalidateEverythingOnDelete],
  },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Stored once. A repeat signup updates the existing row.' },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Which form they used — the homepage block, the footer, or the exit prompt.',
      },
    },
    {
      name: 'forwarded',
      type: 'checkbox',
      defaultValue: false,
      label: 'Sent to Beehiiv',
      admin: {
        readOnly: true,
        description:
          'Ticked once the address reached Beehiiv. Stays unticked while Beehiiv is not configured — the signup is still saved here.',
      },
    },
  ],
}
