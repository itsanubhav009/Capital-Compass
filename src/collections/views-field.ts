import type { Field } from 'payload'

/**
 * Unique readers. Add to each content collection's fields array.
 *
 * Incremented by raw SQL from /api/view the first time each visitor reads the
 * piece — so it counts readers, not page loads — never through the admin
 * panel, so it is read-only in the UI and stays out of the editor's way.
 */
export const viewsField = (): Field => ({
  name: 'views',
  label: 'Readers',
  type: 'number',
  defaultValue: 0,
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Unique readers: each visitor counted once, the first time they open it. Counted automatically.',
  },
})
