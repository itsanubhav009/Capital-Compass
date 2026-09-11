import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"article_slug" varchar NOT NULL,
  	"article_title" varchar,
  	"article_collection" varchar,
  	"approved" boolean DEFAULT false,
  	"meta_ip" varchar,
  	"meta_user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "subscribers" ADD COLUMN "disclaimer_accepted" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "comments_id" integer;
  CREATE INDEX "comments_article_slug_idx" ON "comments" USING btree ("article_slug");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "comments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_comments_fk";
  
  DROP INDEX "payload_locked_documents_rels_comments_id_idx";
  ALTER TABLE "subscribers" DROP COLUMN "disclaimer_accepted";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "comments_id";`)
}
