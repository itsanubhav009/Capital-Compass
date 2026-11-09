import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "article_disclaimer" SET DEFAULT 'Smart Money Express publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_legal_name" SET DEFAULT 'Smart Money Express';
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'Smart Money Express';
  ALTER TABLE "subscribers" ADD COLUMN "suppressed_reason" varchar;
  ALTER TABLE "newsletter_sends_recipients" ADD COLUMN "resend_id" varchar;
  ALTER TABLE "newsletter_sends_recipients" ADD COLUMN "last_event" varchar;
  ALTER TABLE "newsletter_sends_recipients" ADD COLUMN "opened_at" timestamp(3) with time zone;
  ALTER TABLE "newsletter_sends_recipients" ADD COLUMN "clicked_at" timestamp(3) with time zone;
  ALTER TABLE "newsletter_sends_recipients" ADD COLUMN "placement" varchar;
  ALTER TABLE "newsletter_sends" ADD COLUMN "provider" varchar;
  CREATE INDEX IF NOT EXISTS "newsletter_sends_recipients_resend_id_idx" ON "newsletter_sends_recipients" USING btree ("resend_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "article_disclaimer" SET DEFAULT 'SmartMoney publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_legal_name" SET DEFAULT 'SmartMoney Express';
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'SmartMoney Express';
  ALTER TABLE "subscribers" DROP COLUMN "suppressed_reason";
  DROP INDEX IF EXISTS "newsletter_sends_recipients_resend_id_idx";
  ALTER TABLE "newsletter_sends_recipients" DROP COLUMN "resend_id";
  ALTER TABLE "newsletter_sends_recipients" DROP COLUMN "last_event";
  ALTER TABLE "newsletter_sends_recipients" DROP COLUMN "opened_at";
  ALTER TABLE "newsletter_sends_recipients" DROP COLUMN "clicked_at";
  ALTER TABLE "newsletter_sends_recipients" DROP COLUMN "placement";
  ALTER TABLE "newsletter_sends" DROP COLUMN "provider";`)
}
