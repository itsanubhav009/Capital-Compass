import * as migration_20260828_200810_initial from './20260828_200810_initial';
import * as migration_20260828_213400_add_pages_and_contact from './20260828_213400_add_pages_and_contact';
import * as migration_20260904_190832_add_views_column from './20260904_190832_add_views_column';
import * as migration_20260904_192244_add_subscribers from './20260904_192244_add_subscribers';
import * as migration_20260911_043520_add_comments_and_subscriber_consent from './20260911_043520_add_comments_and_subscriber_consent';
import * as migration_20260917_135936_remove_flows_and_summary from './20260917_135936_remove_flows_and_summary';
import * as migration_20260919_053358_remove_company_tab from './20260919_053358_remove_company_tab';

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
    name: '20260904_192244_add_subscribers',
  },
  {
    up: migration_20260911_043520_add_comments_and_subscriber_consent.up,
    down: migration_20260911_043520_add_comments_and_subscriber_consent.down,
    name: '20260911_043520_add_comments_and_subscriber_consent',
  },
  {
    up: migration_20260917_135936_remove_flows_and_summary.up,
    down: migration_20260917_135936_remove_flows_and_summary.down,
    name: '20260917_135936_remove_flows_and_summary',
  },
  {
    up: migration_20260919_053358_remove_company_tab.up,
    down: migration_20260919_053358_remove_company_tab.down,
    name: '20260919_053358_remove_company_tab'
  },
];
