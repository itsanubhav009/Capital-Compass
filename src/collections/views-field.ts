import type { Field } from 'payload'

/**
 * View counter. Add to each content collection's fields array.
 *
 * Incremented by raw SQL from /api/view, never through the admin panel, so it
 * is read-only in the UI and stays out of the editor's normal workflow.
 */
export const viewsField = (): Field => ({
  name: 'views',
  type: 'number',
  defaultValue: 0,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Counted automatically. Not editable.',
  },
})
