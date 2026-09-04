import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    description:
      'Who can sign in. Editors write and publish content; only an Owner can change roles or add people.',
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Shown in the admin only.' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner — full access, including roles', value: 'owner' },
        { label: 'Editor — writes and publishes content', value: 'editor' },
      ],
      admin: { description: 'Only an Owner can change this.' },
      access: { update: ({ req }) => req.user?.role === 'owner' },
    },
    {
      name: 'byline',
      type: 'text',
      admin: {
        description:
          'Name readers see on articles. Leave blank to publish under the site name instead.',
      },
    },
  ],
}
