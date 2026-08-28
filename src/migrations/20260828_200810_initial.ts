import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_smart_money_reports_exchange" AS ENUM('NSE', 'BSE', 'Both');
  CREATE TYPE "public"."enum_smart_money_reports_market_cap_band" AS ENUM('Large cap', 'Mid cap', 'Small cap');
  CREATE TYPE "public"."enum_smart_money_reports_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__smart_money_reports_v_version_exchange" AS ENUM('NSE', 'BSE', 'Both');
  CREATE TYPE "public"."enum__smart_money_reports_v_version_market_cap_band" AS ENUM('Large cap', 'Mid cap', 'Small cap');
  CREATE TYPE "public"."enum__smart_money_reports_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_macro_notes_region" AS ENUM('India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global');
  CREATE TYPE "public"."enum_macro_notes_asset_class" AS ENUM('Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset');
  CREATE TYPE "public"."enum_macro_notes_impact" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum_macro_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__macro_notes_v_version_region" AS ENUM('India', 'United States', 'Europe', 'China', 'Emerging markets', 'Global');
  CREATE TYPE "public"."enum__macro_notes_v_version_asset_class" AS ENUM('Equities', 'Interest rates', 'Currencies', 'Commodities', 'Credit', 'Cross-asset');
  CREATE TYPE "public"."enum__macro_notes_v_version_impact" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum__macro_notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_theme_reports_capital_flow_trend" AS ENUM('accelerating', 'steady', 'cooling', 'reversing');
  CREATE TYPE "public"."enum_theme_reports_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__theme_reports_v_version_capital_flow_trend" AS ENUM('accelerating', 'steady', 'cooling', 'reversing');
  CREATE TYPE "public"."enum__theme_reports_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_wealth_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__wealth_articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sections_accent" AS ENUM('deep', 'brass', 'inflow', 'outflow', 'ink');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'editor');
  CREATE TABLE "smart_money_reports_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "smart_money_reports_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone
  );
  
  CREATE TABLE "smart_money_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"section_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"stock_name" varchar,
  	"ticker" varchar,
  	"exchange" "enum_smart_money_reports_exchange" DEFAULT 'NSE',
  	"sector_id" integer,
  	"market_cap_band" "enum_smart_money_reports_market_cap_band",
  	"market_cap_cr" numeric,
  	"flows_fii" numeric,
  	"flows_dii" numeric,
  	"flows_promoter" numeric,
  	"flows_technical" numeric,
  	"flows_fundamental" numeric,
  	"flows_as_of" timestamp(3) with time zone,
  	"flows_basis" varchar DEFAULT 'Trailing 4 weeks',
  	"standfirst" varchar,
  	"featured_image_id" integer,
  	"ai_summary" varchar,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_smart_money_reports_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_smart_money_reports_v_version_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_smart_money_reports_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_smart_money_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_minutes" numeric,
  	"version_stock_name" varchar,
  	"version_ticker" varchar,
  	"version_exchange" "enum__smart_money_reports_v_version_exchange" DEFAULT 'NSE',
  	"version_sector_id" integer,
  	"version_market_cap_band" "enum__smart_money_reports_v_version_market_cap_band",
  	"version_market_cap_cr" numeric,
  	"version_flows_fii" numeric,
  	"version_flows_dii" numeric,
  	"version_flows_promoter" numeric,
  	"version_flows_technical" numeric,
  	"version_flows_fundamental" numeric,
  	"version_flows_as_of" timestamp(3) with time zone,
  	"version_flows_basis" varchar DEFAULT 'Trailing 4 weeks',
  	"version_standfirst" varchar,
  	"version_featured_image_id" integer,
  	"version_ai_summary" varchar,
  	"version_body" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__smart_money_reports_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "macro_notes_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "macro_notes_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone
  );
  
  CREATE TABLE "macro_notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"section_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"region" "enum_macro_notes_region",
  	"asset_class" "enum_macro_notes_asset_class",
  	"impact" "enum_macro_notes_impact" DEFAULT 'neutral',
  	"impact_note" varchar,
  	"standfirst" varchar,
  	"featured_image_id" integer,
  	"summary" varchar,
  	"commentary" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_macro_notes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_macro_notes_v_version_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_macro_notes_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_macro_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_minutes" numeric,
  	"version_region" "enum__macro_notes_v_version_region",
  	"version_asset_class" "enum__macro_notes_v_version_asset_class",
  	"version_impact" "enum__macro_notes_v_version_impact" DEFAULT 'neutral',
  	"version_impact_note" varchar,
  	"version_standfirst" varchar,
  	"version_featured_image_id" integer,
  	"version_summary" varchar,
  	"version_commentary" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__macro_notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "theme_reports_key_stocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"ticker" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "theme_reports_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "theme_reports_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone
  );
  
  CREATE TABLE "theme_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"section_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"theme_id" integer,
  	"industry" varchar,
  	"capital_flow_trend" "enum_theme_reports_capital_flow_trend" DEFAULT 'steady',
  	"standfirst" varchar,
  	"featured_image_id" integer,
  	"outlook" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_theme_reports_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_theme_reports_v_version_key_stocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"ticker" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_theme_reports_v_version_charts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_theme_reports_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_theme_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_minutes" numeric,
  	"version_theme_id" integer,
  	"version_industry" varchar,
  	"version_capital_flow_trend" "enum__theme_reports_v_version_capital_flow_trend" DEFAULT 'steady',
  	"version_standfirst" varchar,
  	"version_featured_image_id" integer,
  	"version_outlook" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__theme_reports_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "wealth_articles_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone
  );
  
  CREATE TABLE "wealth_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"section_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"standfirst" varchar,
  	"featured_image_id" integer,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_wealth_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "wealth_articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_wealth_articles_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"published_on" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_wealth_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_reading_minutes" numeric,
  	"version_standfirst" varchar,
  	"version_featured_image_id" integer,
  	"version_body" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__wealth_articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_wealth_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"blurb" varchar,
  	"accent" "enum_sections_accent" DEFAULT 'deep',
  	"nav_order" numeric DEFAULT 100,
  	"show_in_nav" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "themes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"byline" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"smart_money_reports_id" integer,
  	"macro_notes_id" integer,
  	"theme_reports_id" integer,
  	"wealth_articles_id" integer,
  	"sections_id" integer,
  	"sectors_id" integer,
  	"themes_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"philosophy_eyebrow" varchar DEFAULT 'How to read this site',
  	"philosophy_heading" varchar DEFAULT 'We track where large investors actually put their money, and explain why in plain English.' NOT NULL,
  	"philosophy_body" varchar DEFAULT 'No tips, no target prices, no calls. Foreign institutions, domestic funds and promoters leave a paper trail every week. We read it, check it, and write up what changed — so you can form your own view in ten minutes rather than an afternoon.',
  	"flow_tape_heading" varchar DEFAULT 'Latest institutional activity',
  	"show_ai_search_placeholder" boolean DEFAULT true,
  	"newsletter_heading" varchar DEFAULT 'The Weekly Capital Flow Report',
  	"newsletter_body" varchar DEFAULT 'One email each Sunday. What the institutions bought and sold, what changed in the macro picture, and which themes are drawing capital. Free.',
  	"newsletter_cta" varchar DEFAULT 'Subscribe',
  	"newsletter_fine_print" varchar DEFAULT 'No spam. Unsubscribe in one click.',
  	"exit_intent_enabled" boolean DEFAULT true,
  	"article_disclaimer" varchar DEFAULT 'Capital Compass publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.' NOT NULL,
  	"flow_indicator_explainer" varchar DEFAULT 'Flow indicators run from -100 to +100 and show net direction of activity over the stated period. A positive figure means net buying was observed. It is not a score, a rating, or a forecast.' NOT NULL,
  	"footer_legal_name" varchar DEFAULT 'Capital Compass',
  	"site_name" varchar DEFAULT 'Capital Compass' NOT NULL,
  	"tagline" varchar DEFAULT 'Where the money actually went',
  	"default_meta_description" varchar DEFAULT 'Institutional flow analysis for HNI and NRI investors. Foreign and domestic fund activity, promoter moves, macro and sector themes — explained plainly.',
  	"og_image_id" integer,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "smart_money_reports_charts" ADD CONSTRAINT "smart_money_reports_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "smart_money_reports_charts" ADD CONSTRAINT "smart_money_reports_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."smart_money_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "smart_money_reports_references" ADD CONSTRAINT "smart_money_reports_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."smart_money_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "smart_money_reports" ADD CONSTRAINT "smart_money_reports_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "smart_money_reports" ADD CONSTRAINT "smart_money_reports_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "smart_money_reports" ADD CONSTRAINT "smart_money_reports_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "smart_money_reports" ADD CONSTRAINT "smart_money_reports_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v_version_charts" ADD CONSTRAINT "_smart_money_reports_v_version_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v_version_charts" ADD CONSTRAINT "_smart_money_reports_v_version_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_smart_money_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v_version_references" ADD CONSTRAINT "_smart_money_reports_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_smart_money_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_parent_id_smart_money_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."smart_money_reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_version_sector_id_sectors_id_fk" FOREIGN KEY ("version_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "macro_notes_charts" ADD CONSTRAINT "macro_notes_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "macro_notes_charts" ADD CONSTRAINT "macro_notes_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."macro_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "macro_notes_references" ADD CONSTRAINT "macro_notes_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."macro_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "macro_notes" ADD CONSTRAINT "macro_notes_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "macro_notes" ADD CONSTRAINT "macro_notes_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "macro_notes" ADD CONSTRAINT "macro_notes_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_macro_notes_v_version_charts" ADD CONSTRAINT "_macro_notes_v_version_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_macro_notes_v_version_charts" ADD CONSTRAINT "_macro_notes_v_version_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_macro_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_macro_notes_v_version_references" ADD CONSTRAINT "_macro_notes_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_macro_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_macro_notes_v" ADD CONSTRAINT "_macro_notes_v_parent_id_macro_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."macro_notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_macro_notes_v" ADD CONSTRAINT "_macro_notes_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_macro_notes_v" ADD CONSTRAINT "_macro_notes_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_macro_notes_v" ADD CONSTRAINT "_macro_notes_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme_reports_key_stocks" ADD CONSTRAINT "theme_reports_key_stocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."theme_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "theme_reports_charts" ADD CONSTRAINT "theme_reports_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme_reports_charts" ADD CONSTRAINT "theme_reports_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."theme_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "theme_reports_references" ADD CONSTRAINT "theme_reports_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."theme_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "theme_reports" ADD CONSTRAINT "theme_reports_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme_reports" ADD CONSTRAINT "theme_reports_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme_reports" ADD CONSTRAINT "theme_reports_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme_reports" ADD CONSTRAINT "theme_reports_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v_version_key_stocks" ADD CONSTRAINT "_theme_reports_v_version_key_stocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_theme_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_theme_reports_v_version_charts" ADD CONSTRAINT "_theme_reports_v_version_charts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v_version_charts" ADD CONSTRAINT "_theme_reports_v_version_charts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_theme_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_theme_reports_v_version_references" ADD CONSTRAINT "_theme_reports_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_theme_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_theme_reports_v" ADD CONSTRAINT "_theme_reports_v_parent_id_theme_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."theme_reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v" ADD CONSTRAINT "_theme_reports_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v" ADD CONSTRAINT "_theme_reports_v_version_theme_id_themes_id_fk" FOREIGN KEY ("version_theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v" ADD CONSTRAINT "_theme_reports_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_theme_reports_v" ADD CONSTRAINT "_theme_reports_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wealth_articles_references" ADD CONSTRAINT "wealth_articles_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wealth_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wealth_articles" ADD CONSTRAINT "wealth_articles_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wealth_articles" ADD CONSTRAINT "wealth_articles_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wealth_articles" ADD CONSTRAINT "wealth_articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wealth_articles_texts" ADD CONSTRAINT "wealth_articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wealth_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v_version_references" ADD CONSTRAINT "_wealth_articles_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_wealth_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v" ADD CONSTRAINT "_wealth_articles_v_parent_id_wealth_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wealth_articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v" ADD CONSTRAINT "_wealth_articles_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v" ADD CONSTRAINT "_wealth_articles_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v" ADD CONSTRAINT "_wealth_articles_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wealth_articles_v_texts" ADD CONSTRAINT "_wealth_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_wealth_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_smart_money_reports_fk" FOREIGN KEY ("smart_money_reports_id") REFERENCES "public"."smart_money_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_macro_notes_fk" FOREIGN KEY ("macro_notes_id") REFERENCES "public"."macro_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_theme_reports_fk" FOREIGN KEY ("theme_reports_id") REFERENCES "public"."theme_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wealth_articles_fk" FOREIGN KEY ("wealth_articles_id") REFERENCES "public"."wealth_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sections_fk" FOREIGN KEY ("sections_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "smart_money_reports_charts_order_idx" ON "smart_money_reports_charts" USING btree ("_order");
  CREATE INDEX "smart_money_reports_charts_parent_id_idx" ON "smart_money_reports_charts" USING btree ("_parent_id");
  CREATE INDEX "smart_money_reports_charts_image_idx" ON "smart_money_reports_charts" USING btree ("image_id");
  CREATE INDEX "smart_money_reports_references_order_idx" ON "smart_money_reports_references" USING btree ("_order");
  CREATE INDEX "smart_money_reports_references_parent_id_idx" ON "smart_money_reports_references" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "smart_money_reports_slug_idx" ON "smart_money_reports" USING btree ("slug");
  CREATE INDEX "smart_money_reports_section_idx" ON "smart_money_reports" USING btree ("section_id");
  CREATE INDEX "smart_money_reports_published_at_idx" ON "smart_money_reports" USING btree ("published_at");
  CREATE INDEX "smart_money_reports_sector_idx" ON "smart_money_reports" USING btree ("sector_id");
  CREATE INDEX "smart_money_reports_featured_image_idx" ON "smart_money_reports" USING btree ("featured_image_id");
  CREATE INDEX "smart_money_reports_meta_meta_image_idx" ON "smart_money_reports" USING btree ("meta_image_id");
  CREATE INDEX "smart_money_reports_updated_at_idx" ON "smart_money_reports" USING btree ("updated_at");
  CREATE INDEX "smart_money_reports_created_at_idx" ON "smart_money_reports" USING btree ("created_at");
  CREATE INDEX "smart_money_reports__status_idx" ON "smart_money_reports" USING btree ("_status");
  CREATE INDEX "_smart_money_reports_v_version_charts_order_idx" ON "_smart_money_reports_v_version_charts" USING btree ("_order");
  CREATE INDEX "_smart_money_reports_v_version_charts_parent_id_idx" ON "_smart_money_reports_v_version_charts" USING btree ("_parent_id");
  CREATE INDEX "_smart_money_reports_v_version_charts_image_idx" ON "_smart_money_reports_v_version_charts" USING btree ("image_id");
  CREATE INDEX "_smart_money_reports_v_version_references_order_idx" ON "_smart_money_reports_v_version_references" USING btree ("_order");
  CREATE INDEX "_smart_money_reports_v_version_references_parent_id_idx" ON "_smart_money_reports_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_smart_money_reports_v_parent_idx" ON "_smart_money_reports_v" USING btree ("parent_id");
  CREATE INDEX "_smart_money_reports_v_version_version_slug_idx" ON "_smart_money_reports_v" USING btree ("version_slug");
  CREATE INDEX "_smart_money_reports_v_version_version_section_idx" ON "_smart_money_reports_v" USING btree ("version_section_id");
  CREATE INDEX "_smart_money_reports_v_version_version_published_at_idx" ON "_smart_money_reports_v" USING btree ("version_published_at");
  CREATE INDEX "_smart_money_reports_v_version_version_sector_idx" ON "_smart_money_reports_v" USING btree ("version_sector_id");
  CREATE INDEX "_smart_money_reports_v_version_version_featured_image_idx" ON "_smart_money_reports_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_smart_money_reports_v_version_meta_version_meta_image_idx" ON "_smart_money_reports_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_smart_money_reports_v_version_version_updated_at_idx" ON "_smart_money_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_smart_money_reports_v_version_version_created_at_idx" ON "_smart_money_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_smart_money_reports_v_version_version__status_idx" ON "_smart_money_reports_v" USING btree ("version__status");
  CREATE INDEX "_smart_money_reports_v_created_at_idx" ON "_smart_money_reports_v" USING btree ("created_at");
  CREATE INDEX "_smart_money_reports_v_updated_at_idx" ON "_smart_money_reports_v" USING btree ("updated_at");
  CREATE INDEX "_smart_money_reports_v_latest_idx" ON "_smart_money_reports_v" USING btree ("latest");
  CREATE INDEX "_smart_money_reports_v_autosave_idx" ON "_smart_money_reports_v" USING btree ("autosave");
  CREATE INDEX "macro_notes_charts_order_idx" ON "macro_notes_charts" USING btree ("_order");
  CREATE INDEX "macro_notes_charts_parent_id_idx" ON "macro_notes_charts" USING btree ("_parent_id");
  CREATE INDEX "macro_notes_charts_image_idx" ON "macro_notes_charts" USING btree ("image_id");
  CREATE INDEX "macro_notes_references_order_idx" ON "macro_notes_references" USING btree ("_order");
  CREATE INDEX "macro_notes_references_parent_id_idx" ON "macro_notes_references" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "macro_notes_slug_idx" ON "macro_notes" USING btree ("slug");
  CREATE INDEX "macro_notes_section_idx" ON "macro_notes" USING btree ("section_id");
  CREATE INDEX "macro_notes_published_at_idx" ON "macro_notes" USING btree ("published_at");
  CREATE INDEX "macro_notes_featured_image_idx" ON "macro_notes" USING btree ("featured_image_id");
  CREATE INDEX "macro_notes_meta_meta_image_idx" ON "macro_notes" USING btree ("meta_image_id");
  CREATE INDEX "macro_notes_updated_at_idx" ON "macro_notes" USING btree ("updated_at");
  CREATE INDEX "macro_notes_created_at_idx" ON "macro_notes" USING btree ("created_at");
  CREATE INDEX "macro_notes__status_idx" ON "macro_notes" USING btree ("_status");
  CREATE INDEX "_macro_notes_v_version_charts_order_idx" ON "_macro_notes_v_version_charts" USING btree ("_order");
  CREATE INDEX "_macro_notes_v_version_charts_parent_id_idx" ON "_macro_notes_v_version_charts" USING btree ("_parent_id");
  CREATE INDEX "_macro_notes_v_version_charts_image_idx" ON "_macro_notes_v_version_charts" USING btree ("image_id");
  CREATE INDEX "_macro_notes_v_version_references_order_idx" ON "_macro_notes_v_version_references" USING btree ("_order");
  CREATE INDEX "_macro_notes_v_version_references_parent_id_idx" ON "_macro_notes_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_macro_notes_v_parent_idx" ON "_macro_notes_v" USING btree ("parent_id");
  CREATE INDEX "_macro_notes_v_version_version_slug_idx" ON "_macro_notes_v" USING btree ("version_slug");
  CREATE INDEX "_macro_notes_v_version_version_section_idx" ON "_macro_notes_v" USING btree ("version_section_id");
  CREATE INDEX "_macro_notes_v_version_version_published_at_idx" ON "_macro_notes_v" USING btree ("version_published_at");
  CREATE INDEX "_macro_notes_v_version_version_featured_image_idx" ON "_macro_notes_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_macro_notes_v_version_meta_version_meta_image_idx" ON "_macro_notes_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_macro_notes_v_version_version_updated_at_idx" ON "_macro_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_macro_notes_v_version_version_created_at_idx" ON "_macro_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_macro_notes_v_version_version__status_idx" ON "_macro_notes_v" USING btree ("version__status");
  CREATE INDEX "_macro_notes_v_created_at_idx" ON "_macro_notes_v" USING btree ("created_at");
  CREATE INDEX "_macro_notes_v_updated_at_idx" ON "_macro_notes_v" USING btree ("updated_at");
  CREATE INDEX "_macro_notes_v_latest_idx" ON "_macro_notes_v" USING btree ("latest");
  CREATE INDEX "_macro_notes_v_autosave_idx" ON "_macro_notes_v" USING btree ("autosave");
  CREATE INDEX "theme_reports_key_stocks_order_idx" ON "theme_reports_key_stocks" USING btree ("_order");
  CREATE INDEX "theme_reports_key_stocks_parent_id_idx" ON "theme_reports_key_stocks" USING btree ("_parent_id");
  CREATE INDEX "theme_reports_charts_order_idx" ON "theme_reports_charts" USING btree ("_order");
  CREATE INDEX "theme_reports_charts_parent_id_idx" ON "theme_reports_charts" USING btree ("_parent_id");
  CREATE INDEX "theme_reports_charts_image_idx" ON "theme_reports_charts" USING btree ("image_id");
  CREATE INDEX "theme_reports_references_order_idx" ON "theme_reports_references" USING btree ("_order");
  CREATE INDEX "theme_reports_references_parent_id_idx" ON "theme_reports_references" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "theme_reports_slug_idx" ON "theme_reports" USING btree ("slug");
  CREATE INDEX "theme_reports_section_idx" ON "theme_reports" USING btree ("section_id");
  CREATE INDEX "theme_reports_published_at_idx" ON "theme_reports" USING btree ("published_at");
  CREATE INDEX "theme_reports_theme_idx" ON "theme_reports" USING btree ("theme_id");
  CREATE INDEX "theme_reports_featured_image_idx" ON "theme_reports" USING btree ("featured_image_id");
  CREATE INDEX "theme_reports_meta_meta_image_idx" ON "theme_reports" USING btree ("meta_image_id");
  CREATE INDEX "theme_reports_updated_at_idx" ON "theme_reports" USING btree ("updated_at");
  CREATE INDEX "theme_reports_created_at_idx" ON "theme_reports" USING btree ("created_at");
  CREATE INDEX "theme_reports__status_idx" ON "theme_reports" USING btree ("_status");
  CREATE INDEX "_theme_reports_v_version_key_stocks_order_idx" ON "_theme_reports_v_version_key_stocks" USING btree ("_order");
  CREATE INDEX "_theme_reports_v_version_key_stocks_parent_id_idx" ON "_theme_reports_v_version_key_stocks" USING btree ("_parent_id");
  CREATE INDEX "_theme_reports_v_version_charts_order_idx" ON "_theme_reports_v_version_charts" USING btree ("_order");
  CREATE INDEX "_theme_reports_v_version_charts_parent_id_idx" ON "_theme_reports_v_version_charts" USING btree ("_parent_id");
  CREATE INDEX "_theme_reports_v_version_charts_image_idx" ON "_theme_reports_v_version_charts" USING btree ("image_id");
  CREATE INDEX "_theme_reports_v_version_references_order_idx" ON "_theme_reports_v_version_references" USING btree ("_order");
  CREATE INDEX "_theme_reports_v_version_references_parent_id_idx" ON "_theme_reports_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_theme_reports_v_parent_idx" ON "_theme_reports_v" USING btree ("parent_id");
  CREATE INDEX "_theme_reports_v_version_version_slug_idx" ON "_theme_reports_v" USING btree ("version_slug");
  CREATE INDEX "_theme_reports_v_version_version_section_idx" ON "_theme_reports_v" USING btree ("version_section_id");
  CREATE INDEX "_theme_reports_v_version_version_published_at_idx" ON "_theme_reports_v" USING btree ("version_published_at");
  CREATE INDEX "_theme_reports_v_version_version_theme_idx" ON "_theme_reports_v" USING btree ("version_theme_id");
  CREATE INDEX "_theme_reports_v_version_version_featured_image_idx" ON "_theme_reports_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_theme_reports_v_version_meta_version_meta_image_idx" ON "_theme_reports_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_theme_reports_v_version_version_updated_at_idx" ON "_theme_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_theme_reports_v_version_version_created_at_idx" ON "_theme_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_theme_reports_v_version_version__status_idx" ON "_theme_reports_v" USING btree ("version__status");
  CREATE INDEX "_theme_reports_v_created_at_idx" ON "_theme_reports_v" USING btree ("created_at");
  CREATE INDEX "_theme_reports_v_updated_at_idx" ON "_theme_reports_v" USING btree ("updated_at");
  CREATE INDEX "_theme_reports_v_latest_idx" ON "_theme_reports_v" USING btree ("latest");
  CREATE INDEX "_theme_reports_v_autosave_idx" ON "_theme_reports_v" USING btree ("autosave");
  CREATE INDEX "wealth_articles_references_order_idx" ON "wealth_articles_references" USING btree ("_order");
  CREATE INDEX "wealth_articles_references_parent_id_idx" ON "wealth_articles_references" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "wealth_articles_slug_idx" ON "wealth_articles" USING btree ("slug");
  CREATE INDEX "wealth_articles_section_idx" ON "wealth_articles" USING btree ("section_id");
  CREATE INDEX "wealth_articles_published_at_idx" ON "wealth_articles" USING btree ("published_at");
  CREATE INDEX "wealth_articles_featured_image_idx" ON "wealth_articles" USING btree ("featured_image_id");
  CREATE INDEX "wealth_articles_meta_meta_image_idx" ON "wealth_articles" USING btree ("meta_image_id");
  CREATE INDEX "wealth_articles_updated_at_idx" ON "wealth_articles" USING btree ("updated_at");
  CREATE INDEX "wealth_articles_created_at_idx" ON "wealth_articles" USING btree ("created_at");
  CREATE INDEX "wealth_articles__status_idx" ON "wealth_articles" USING btree ("_status");
  CREATE INDEX "wealth_articles_texts_order_parent" ON "wealth_articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "_wealth_articles_v_version_references_order_idx" ON "_wealth_articles_v_version_references" USING btree ("_order");
  CREATE INDEX "_wealth_articles_v_version_references_parent_id_idx" ON "_wealth_articles_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_wealth_articles_v_parent_idx" ON "_wealth_articles_v" USING btree ("parent_id");
  CREATE INDEX "_wealth_articles_v_version_version_slug_idx" ON "_wealth_articles_v" USING btree ("version_slug");
  CREATE INDEX "_wealth_articles_v_version_version_section_idx" ON "_wealth_articles_v" USING btree ("version_section_id");
  CREATE INDEX "_wealth_articles_v_version_version_published_at_idx" ON "_wealth_articles_v" USING btree ("version_published_at");
  CREATE INDEX "_wealth_articles_v_version_version_featured_image_idx" ON "_wealth_articles_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_wealth_articles_v_version_meta_version_meta_image_idx" ON "_wealth_articles_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_wealth_articles_v_version_version_updated_at_idx" ON "_wealth_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_wealth_articles_v_version_version_created_at_idx" ON "_wealth_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_wealth_articles_v_version_version__status_idx" ON "_wealth_articles_v" USING btree ("version__status");
  CREATE INDEX "_wealth_articles_v_created_at_idx" ON "_wealth_articles_v" USING btree ("created_at");
  CREATE INDEX "_wealth_articles_v_updated_at_idx" ON "_wealth_articles_v" USING btree ("updated_at");
  CREATE INDEX "_wealth_articles_v_latest_idx" ON "_wealth_articles_v" USING btree ("latest");
  CREATE INDEX "_wealth_articles_v_autosave_idx" ON "_wealth_articles_v" USING btree ("autosave");
  CREATE INDEX "_wealth_articles_v_texts_order_parent" ON "_wealth_articles_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "sections_slug_idx" ON "sections" USING btree ("slug");
  CREATE INDEX "sections_updated_at_idx" ON "sections" USING btree ("updated_at");
  CREATE INDEX "sections_created_at_idx" ON "sections" USING btree ("created_at");
  CREATE UNIQUE INDEX "sectors_slug_idx" ON "sectors" USING btree ("slug");
  CREATE INDEX "sectors_updated_at_idx" ON "sectors" USING btree ("updated_at");
  CREATE INDEX "sectors_created_at_idx" ON "sectors" USING btree ("created_at");
  CREATE UNIQUE INDEX "themes_slug_idx" ON "themes" USING btree ("slug");
  CREATE INDEX "themes_updated_at_idx" ON "themes" USING btree ("updated_at");
  CREATE INDEX "themes_created_at_idx" ON "themes" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_smart_money_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("smart_money_reports_id");
  CREATE INDEX "payload_locked_documents_rels_macro_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("macro_notes_id");
  CREATE INDEX "payload_locked_documents_rels_theme_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("theme_reports_id");
  CREATE INDEX "payload_locked_documents_rels_wealth_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("wealth_articles_id");
  CREATE INDEX "payload_locked_documents_rels_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("sections_id");
  CREATE INDEX "payload_locked_documents_rels_sectors_id_idx" ON "payload_locked_documents_rels" USING btree ("sectors_id");
  CREATE INDEX "payload_locked_documents_rels_themes_id_idx" ON "payload_locked_documents_rels" USING btree ("themes_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "smart_money_reports_charts" CASCADE;
  DROP TABLE "smart_money_reports_references" CASCADE;
  DROP TABLE "smart_money_reports" CASCADE;
  DROP TABLE "_smart_money_reports_v_version_charts" CASCADE;
  DROP TABLE "_smart_money_reports_v_version_references" CASCADE;
  DROP TABLE "_smart_money_reports_v" CASCADE;
  DROP TABLE "macro_notes_charts" CASCADE;
  DROP TABLE "macro_notes_references" CASCADE;
  DROP TABLE "macro_notes" CASCADE;
  DROP TABLE "_macro_notes_v_version_charts" CASCADE;
  DROP TABLE "_macro_notes_v_version_references" CASCADE;
  DROP TABLE "_macro_notes_v" CASCADE;
  DROP TABLE "theme_reports_key_stocks" CASCADE;
  DROP TABLE "theme_reports_charts" CASCADE;
  DROP TABLE "theme_reports_references" CASCADE;
  DROP TABLE "theme_reports" CASCADE;
  DROP TABLE "_theme_reports_v_version_key_stocks" CASCADE;
  DROP TABLE "_theme_reports_v_version_charts" CASCADE;
  DROP TABLE "_theme_reports_v_version_references" CASCADE;
  DROP TABLE "_theme_reports_v" CASCADE;
  DROP TABLE "wealth_articles_references" CASCADE;
  DROP TABLE "wealth_articles" CASCADE;
  DROP TABLE "wealth_articles_texts" CASCADE;
  DROP TABLE "_wealth_articles_v_version_references" CASCADE;
  DROP TABLE "_wealth_articles_v" CASCADE;
  DROP TABLE "_wealth_articles_v_texts" CASCADE;
  DROP TABLE "sections" CASCADE;
  DROP TABLE "sectors" CASCADE;
  DROP TABLE "themes" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_smart_money_reports_exchange";
  DROP TYPE "public"."enum_smart_money_reports_market_cap_band";
  DROP TYPE "public"."enum_smart_money_reports_status";
  DROP TYPE "public"."enum__smart_money_reports_v_version_exchange";
  DROP TYPE "public"."enum__smart_money_reports_v_version_market_cap_band";
  DROP TYPE "public"."enum__smart_money_reports_v_version_status";
  DROP TYPE "public"."enum_macro_notes_region";
  DROP TYPE "public"."enum_macro_notes_asset_class";
  DROP TYPE "public"."enum_macro_notes_impact";
  DROP TYPE "public"."enum_macro_notes_status";
  DROP TYPE "public"."enum__macro_notes_v_version_region";
  DROP TYPE "public"."enum__macro_notes_v_version_asset_class";
  DROP TYPE "public"."enum__macro_notes_v_version_impact";
  DROP TYPE "public"."enum__macro_notes_v_version_status";
  DROP TYPE "public"."enum_theme_reports_capital_flow_trend";
  DROP TYPE "public"."enum_theme_reports_status";
  DROP TYPE "public"."enum__theme_reports_v_version_capital_flow_trend";
  DROP TYPE "public"."enum__theme_reports_v_version_status";
  DROP TYPE "public"."enum_wealth_articles_status";
  DROP TYPE "public"."enum__wealth_articles_v_version_status";
  DROP TYPE "public"."enum_sections_accent";
  DROP TYPE "public"."enum_users_role";`)
}
