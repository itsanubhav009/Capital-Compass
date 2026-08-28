import * as migration_20260828_200810_initial from './20260828_200810_initial';

export const migrations = [
  {
    up: migration_20260828_200810_initial.up,
    down: migration_20260828_200810_initial.down,
    name: '20260828_200810_initial'
  },
];
