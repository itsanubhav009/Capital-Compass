import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Tables for counting unique visitors. Not Payload collections: they are
 * written by /api/view with plain SQL, one row per event, and read as counts.
 *
 * visitors       one row per visitor ID. The primary key is the rule that
 *                makes a visitor count once, even when two first views arrive
 *                at the same moment.
 * page_views     every counted hit, kept raw so the method can change later
 *                and the history be recounted.
 * article_reads  one row per visitor per article; its key is what makes an
 *                article's view count a count of readers rather than loads.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "visitors" (
     "id" varchar(64) PRIMARY KEY,
     "first_seen" timestamp(3) with time zone NOT NULL DEFAULT now(),
     "last_seen" timestamp(3) with time zone NOT NULL DEFAULT now(),
     "source" varchar(16) NOT NULL DEFAULT 'cookie'
   );
   CREATE INDEX IF NOT EXISTS "visitors_first_seen_idx" ON "visitors" USING btree ("first_seen");
   CREATE INDEX IF NOT EXISTS "visitors_last_seen_idx" ON "visitors" USING btree ("last_seen");

   CREATE TABLE IF NOT EXISTS "page_views" (
     "id" bigserial PRIMARY KEY,
     "visitor_id" varchar(64) NOT NULL,
     "path" varchar(512) NOT NULL,
     "article_slug" varchar(255),
     "referrer" varchar(512),
     "new_visitor" boolean NOT NULL DEFAULT false,
     "at" timestamp(3) with time zone NOT NULL DEFAULT now()
   );
   CREATE INDEX IF NOT EXISTS "page_views_at_idx" ON "page_views" USING btree ("at");
   CREATE INDEX IF NOT EXISTS "page_views_visitor_idx" ON "page_views" USING btree ("visitor_id");
   CREATE INDEX IF NOT EXISTS "page_views_article_idx" ON "page_views" USING btree ("article_slug");

   CREATE TABLE IF NOT EXISTS "article_reads" (
     "visitor_id" varchar(64) NOT NULL,
     "article_slug" varchar(255) NOT NULL,
     "at" timestamp(3) with time zone NOT NULL DEFAULT now(),
     PRIMARY KEY ("visitor_id", "article_slug")
   );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "article_reads";
   DROP TABLE IF EXISTS "page_views";
   DROP TABLE IF EXISTS "visitors";`)
}
