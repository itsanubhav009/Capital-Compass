import * as migration_20260828_200810_initial from './20260828_200810_initial';
import * as migration_20260828_213400_add_pages_and_contact from './20260828_213400_add_pages_and_contact';
import * as migration_20260904_190832_add_views_column from './20260904_190832_add_views_column';
import * as migration_20260904_192244_add_subscribers from './20260904_192244_add_subscribers';

export const migrations = [
  {
    up: migration_20260828_200810_initial.up,
    down: migration_20260828_200810_initial.down,
    name: '20260828_200810_initial',
  },
  {
    up: migration_20260828_213400_add_pages_and_contact.up,
    down: migration_20260828_213400_add_pages_and_contact.down,
    name: '20260828_213400_add_pages_and_contact',
  },
  {
    up: migration_20260904_190832_add_views_column.up,
    down: migration_20260904_190832_add_views_column.down,
    name: '20260904_190832_add_views_column',
  },
  {
    up: migration_20260904_192244_add_subscribers.up,
    down: migration_20260904_192244_add_subscribers.down,
    name: '20260904_192244_add_subscribers'
  },
];
