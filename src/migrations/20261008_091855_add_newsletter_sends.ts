import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the newsletter send log, and the unsubscribe marker on subscribers.
 *
 * Hand-edited after generation. The generated version also wanted to drop
 * meta_title, meta_description and meta_image_id — and their version_ twins —
 * from smart_money_reports, macro_notes, theme_reports and wealth_articles:
 * twenty-four columns across eight tables, holding the SEO text of 32 still
 * published documents.
 *
 * That is real drift, not a bug: the SEO plugin no longer lists those
 * collections, so Drizzle sees the columns as orphaned and offers to tidy
 * them. But it is drift from a change made weeks ago and has nothing to do
 * with newsletters. Dropping data as a side effect of adding a feature is how
 * a migration becomes something nobody can safely review, so those statements
 * were removed. Postgres is perfectly happy with columns the ORM ignores, and
 * if the legacy tables are ever to be cleared out it should be its own
 * migration, named for what it does.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_newsletter_sends_recipients_status" AS ENUM('delivered', 'failed');

  CREATE TABLE "newsletter_sends_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"status" "enum_newsletter_sends_recipients_status",
  	"error" varchar
  );

  CREATE TABLE "newsletter_sends" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"article_id" integer,
  	"article_title" varchar,
  	"sent_at" timestamp(3) with time zone,
  	"sent_by_id" integer,
  	"delivered" numeric,
  	"failed" numeric,
  	"total" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "subscribers" ADD COLUMN "unsubscribed_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_sends_id" integer;

  ALTER TABLE "newsletter_sends_recipients" ADD CONSTRAINT "newsletter_sends_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletter_sends"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletter_sends" ADD CONSTRAINT "newsletter_sends_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_sends" ADD CONSTRAINT "newsletter_sends_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "newsletter_sends_recipients_order_idx" ON "newsletter_sends_recipients" USING btree ("_order");
  CREATE INDEX "newsletter_sends_recipients_parent_id_idx" ON "newsletter_sends_recipients" USING btree ("_parent_id");
  CREATE INDEX "newsletter_sends_article_idx" ON "newsletter_sends" USING btree ("article_id");
  CREATE INDEX "newsletter_sends_sent_by_idx" ON "newsletter_sends" USING btree ("sent_by_id");
  CREATE INDEX "newsletter_sends_updated_at_idx" ON "newsletter_sends" USING btree ("updated_at");
  CREATE INDEX "newsletter_sends_created_at_idx" ON "newsletter_sends" USING btree ("created_at");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_sends_fk" FOREIGN KEY ("newsletter_sends_id") REFERENCES "public"."newsletter_sends"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_newsletter_sends_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_sends_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletter_sends_fk";
  DROP INDEX "payload_locked_documents_rels_newsletter_sends_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_sends_id";

  DROP TABLE "newsletter_sends_recipients" CASCADE;
  DROP TABLE "newsletter_sends" CASCADE;
  DROP TYPE "public"."enum_newsletter_sends_recipients_status";

  ALTER TABLE "subscribers" DROP COLUMN "unsubscribed_at";`)
}
