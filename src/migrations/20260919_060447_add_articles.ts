import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_region" AS ENUM('India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global');
  CREATE TYPE "public"."enum_articles_asset_class" AS ENUM('Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset');
  CREATE TYPE "public"."enum_articles_impact" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum_articles_capital_flow_trend" AS ENUM('accelerating', 'steady', 'cooling', 'reversing');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_region" AS ENUM('India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global');
  CREATE TYPE "public"."enum__articles_v_version_asset_class" AS ENUM('Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset');
  CREATE TYPE "public"."enum__articles_v_version_impact" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum__articles_v_version_capital_flow_trend" AS ENUM('accelerating', 'steady', 'cooling', 'reversing');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "articles_key_stocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"ticker" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "articles_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone
  );
  
  CREATE TABLE "articles_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"section_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"placement_hero" boolean DEFAULT true,
  	"placement_rails" boolean DEFAULT true,
  	"placement_latest" boolean DEFAULT true,
  	"placement_section_band" boolean DEFAULT true,
  	"placement_sector_themes" boolean DEFAULT true,
  	"standfirst" varchar,
  	"featured_image_id" integer,
  	"body" jsonb,
  	"region" "enum_articles_region",
  	"asset_class" "enum_articles_asset_class",
  	"impact" "enum_articles_impact",
  	"impact_note" varchar,
  	"theme_id" integer,
  	"industry" varchar,
  	"capital_flow_trend" "enum_articles_capital_flow_trend",
  	"views" numeric DEFAULT 0,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_articles_v_version_key_stocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"ticker" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_version_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_minutes" numeric,
  	"version_placement_hero" boolean DEFAULT true,
  	"version_placement_rails" boolean DEFAULT true,
  	"version_placement_latest" boolean DEFAULT true,
  	"version_placement_section_band" boolean DEFAULT true,
  	"version_placement_sector_themes" boolean DEFAULT true,
  	"version_standfirst" varchar,
  	"version_featured_image_id" integer,
  	"version_body" jsonb,
  	"version_region" "enum__articles_v_version_region",
  	"version_asset_class" "enum__articles_v_version_asset_class",
  	"version_impact" "enum__articles_v_version_impact",
  	"version_impact_note" varchar,
  	"version_theme_id" integer,
  	"version_industry" varchar,
  	"version_capital_flow_trend" "enum__articles_v_version_capital_flow_trend",
  	"version_views" numeric DEFAULT 0,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "articles_key_stocks" ADD CONSTRAINT "articles_key_stocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_references" ADD CONSTRAINT "articles_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_charts" ADD CONSTRAINT "articles_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_charts" ADD CONSTRAINT "articles_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_key_stocks" ADD CONSTRAINT "_articles_v_version_key_stocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_references" ADD CONSTRAINT "_articles_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_charts" ADD CONSTRAINT "_articles_v_version_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_version_charts" ADD CONSTRAINT "_articles_v_version_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_theme_id_themes_id_fk" FOREIGN KEY ("version_theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_texts" ADD CONSTRAINT "_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_key_stocks_order_idx" ON "articles_key_stocks" USING btree ("_order");
  CREATE INDEX "articles_key_stocks_parent_id_idx" ON "articles_key_stocks" USING btree ("_parent_id");
  CREATE INDEX "articles_references_order_idx" ON "articles_references" USING btree ("_order");
  CREATE INDEX "articles_references_parent_id_idx" ON "articles_references" USING btree ("_parent_id");
  CREATE INDEX "articles_charts_order_idx" ON "articles_charts" USING btree ("_order");
  CREATE INDEX "articles_charts_parent_id_idx" ON "articles_charts" USING btree ("_parent_id");
  CREATE INDEX "articles_charts_image_idx" ON "articles_charts" USING btree ("image_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_section_idx" ON "articles" USING btree ("section_id");
  CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
  CREATE INDEX "articles_featured_image_idx" ON "articles" USING btree ("featured_image_id");
  CREATE INDEX "articles_theme_idx" ON "articles" USING btree ("theme_id");
  CREATE INDEX "articles_views_idx" ON "articles" USING btree ("views");
  CREATE INDEX "articles_meta_meta_image_idx" ON "articles" USING btree ("meta_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "_articles_v_version_key_stocks_order_idx" ON "_articles_v_version_key_stocks" USING btree ("_order");
  CREATE INDEX "_articles_v_version_key_stocks_parent_id_idx" ON "_articles_v_version_key_stocks" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_references_order_idx" ON "_articles_v_version_references" USING btree ("_order");
  CREATE INDEX "_articles_v_version_references_parent_id_idx" ON "_articles_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_charts_order_idx" ON "_articles_v_version_charts" USING btree ("_order");
  CREATE INDEX "_articles_v_version_charts_parent_id_idx" ON "_articles_v_version_charts" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_charts_image_idx" ON "_articles_v_version_charts" USING btree ("image_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_section_idx" ON "_articles_v" USING btree ("version_section_id");
  CREATE INDEX "_articles_v_version_version_published_at_idx" ON "_articles_v" USING btree ("version_published_at");
  CREATE INDEX "_articles_v_version_version_featured_image_idx" ON "_articles_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_articles_v_version_version_theme_idx" ON "_articles_v" USING btree ("version_theme_id");
  CREATE INDEX "_articles_v_version_version_views_idx" ON "_articles_v" USING btree ("version_views");
  CREATE INDEX "_articles_v_version_meta_version_meta_image_idx" ON "_articles_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_texts_order_parent" ON "_articles_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_key_stocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_references" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_charts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_key_stocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_references" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_charts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_key_stocks" CASCADE;
  DROP TABLE "articles_references" CASCADE;
  DROP TABLE "articles_charts" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "_articles_v_version_key_stocks" CASCADE;
  DROP TABLE "_articles_v_version_references" CASCADE;
  DROP TABLE "_articles_v_version_charts" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  DROP TYPE "public"."enum_articles_region";
  DROP TYPE "public"."enum_articles_asset_class";
  DROP TYPE "public"."enum_articles_impact";
  DROP TYPE "public"."enum_articles_capital_flow_trend";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_region";
  DROP TYPE "public"."enum__articles_v_version_asset_class";
  DROP TYPE "public"."enum__articles_v_version_impact";
  DROP TYPE "public"."enum__articles_v_version_capital_flow_trend";
  DROP TYPE "public"."enum__articles_v_version_status";`)
}
