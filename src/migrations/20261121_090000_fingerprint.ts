import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Phase 2 of unique-visitor counting: Fingerprint for visitors with no ID.
 *
 * visitors.fp_visitor_id  Fingerprint's ID for this visitor, unique, so a
 *                         reader who cleared cookies or opened a private
 *                         window is matched back to the visitor they were
 *                         instead of counted again.
 * page_views.id_source    how the hit's visitor was known: cookie,
 *                         fingerprint (new), fingerprint-match (recognised),
 *                         no-consent, blocked (script failed, often an ad
 *                         blocker), over-limit (free calls used up). So a
 *                         number can be read knowing what it rests on.
 * fingerprint_usage       identification calls per month, against the free
 *                         plan's limit, with the 70% alert recorded once.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "visitors" ADD COLUMN IF NOT EXISTS "fp_visitor_id" varchar(64);
   CREATE UNIQUE INDEX IF NOT EXISTS "visitors_fp_visitor_id_idx" ON "visitors" ("fp_visitor_id") WHERE "fp_visitor_id" IS NOT NULL;
   ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "id_source" varchar(24) NOT NULL DEFAULT 'cookie';
   CREATE TABLE IF NOT EXISTS "fingerprint_usage" (
     "month" char(7) PRIMARY KEY,
     "calls" integer NOT NULL DEFAULT 0,
     "alerted_at" timestamp(3) with time zone
   );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "fingerprint_usage";
   ALTER TABLE "page_views" DROP COLUMN IF EXISTS "id_source";
   DROP INDEX IF EXISTS "visitors_fp_visitor_id_idx";
   ALTER TABLE "visitors" DROP COLUMN IF EXISTS "fp_visitor_id";`)
}
