import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "smart_money_reports" DROP CONSTRAINT "smart_money_reports_sector_id_sectors_id_fk";
  
  ALTER TABLE "_smart_money_reports_v" DROP CONSTRAINT "_smart_money_reports_v_version_sector_id_sectors_id_fk";
  
  DROP INDEX "smart_money_reports_sector_idx";
  DROP INDEX "_smart_money_reports_v_version_version_sector_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "article_disclaimer" SET DEFAULT 'SmartMoney publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_legal_name" SET DEFAULT 'SmartMoney Express';
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'SmartMoney Express';
  ALTER TABLE "smart_money_reports" DROP COLUMN "stock_name";
  ALTER TABLE "smart_money_reports" DROP COLUMN "ticker";
  ALTER TABLE "smart_money_reports" DROP COLUMN "exchange";
  ALTER TABLE "smart_money_reports" DROP COLUMN "sector_id";
  ALTER TABLE "smart_money_reports" DROP COLUMN "market_cap_band";
  ALTER TABLE "smart_money_reports" DROP COLUMN "market_cap_cr";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_stock_name";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_ticker";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_exchange";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_sector_id";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_market_cap_band";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_market_cap_cr";
  DROP TYPE "public"."enum_smart_money_reports_exchange";
  DROP TYPE "public"."enum_smart_money_reports_market_cap_band";
  DROP TYPE "public"."enum__smart_money_reports_v_version_exchange";
  DROP TYPE "public"."enum__smart_money_reports_v_version_market_cap_band";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_smart_money_reports_exchange" AS ENUM('NSE', 'BSE', 'Both');
  CREATE TYPE "public"."enum_smart_money_reports_market_cap_band" AS ENUM('Large cap', 'Mid cap', 'Small cap');
  CREATE TYPE "public"."enum__smart_money_reports_v_version_exchange" AS ENUM('NSE', 'BSE', 'Both');
  CREATE TYPE "public"."enum__smart_money_reports_v_version_market_cap_band" AS ENUM('Large cap', 'Mid cap', 'Small cap');
  ALTER TABLE "site_settings" ALTER COLUMN "article_disclaimer" SET DEFAULT 'Capital Compass publishes financial journalism, not investment advice. Nothing here is a recommendation to buy or sell any security. Flow indicators describe observed institutional activity over a stated period; they are not ratings and carry no view on future prices. Do your own research or speak to a registered adviser.';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_legal_name" SET DEFAULT 'Capital Compass';
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'Capital Compass';
  ALTER TABLE "smart_money_reports" ADD COLUMN "stock_name" varchar;
  ALTER TABLE "smart_money_reports" ADD COLUMN "ticker" varchar;
  ALTER TABLE "smart_money_reports" ADD COLUMN "exchange" "enum_smart_money_reports_exchange" DEFAULT 'NSE';
  ALTER TABLE "smart_money_reports" ADD COLUMN "sector_id" integer;
  ALTER TABLE "smart_money_reports" ADD COLUMN "market_cap_band" "enum_smart_money_reports_market_cap_band";
  ALTER TABLE "smart_money_reports" ADD COLUMN "market_cap_cr" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_stock_name" varchar;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_ticker" varchar;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_exchange" "enum__smart_money_reports_v_version_exchange" DEFAULT 'NSE';
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_sector_id" integer;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_market_cap_band" "enum__smart_money_reports_v_version_market_cap_band";
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_market_cap_cr" numeric;
  ALTER TABLE "smart_money_reports" ADD CONSTRAINT "smart_money_reports_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_smart_money_reports_v" ADD CONSTRAINT "_smart_money_reports_v_version_sector_id_sectors_id_fk" FOREIGN KEY ("version_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "smart_money_reports_sector_idx" ON "smart_money_reports" USING btree ("sector_id");
  CREATE INDEX "_smart_money_reports_v_version_version_sector_idx" ON "_smart_money_reports_v" USING btree ("version_sector_id");`)
}
