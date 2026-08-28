import * as migration_20260828_200810_initial from './20260828_200810_initial';
import * as migration_20260828_213400_add_pages_and_contact from './20260828_213400_add_pages_and_contact';

export const migrations = [
  {
    up: migration_20260828_200810_initial.up,
    down: migration_20260828_200810_initial.down,
    name: '20260828_200810_initial',
  },
  {
    up: migration_20260828_213400_add_pages_and_contact.up,
    down: migration_20260828_213400_add_pages_and_contact.down,
    name: '20260828_213400_add_pages_and_contact'
  },
];
