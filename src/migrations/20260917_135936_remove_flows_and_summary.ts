import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "smart_money_reports" DROP COLUMN "flows_fii";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_dii";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_promoter";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_technical";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_fundamental";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_as_of";
  ALTER TABLE "smart_money_reports" DROP COLUMN "flows_basis";
  ALTER TABLE "smart_money_reports" DROP COLUMN "ai_summary";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_fii";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_dii";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_promoter";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_technical";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_fundamental";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_as_of";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_flows_basis";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_ai_summary";
  ALTER TABLE "site_settings" DROP COLUMN "flow_tape_heading";
  ALTER TABLE "site_settings" DROP COLUMN "flow_indicator_explainer";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "smart_money_reports" ADD COLUMN "flows_fii" numeric;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_dii" numeric;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_promoter" numeric;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_technical" numeric;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_fundamental" numeric;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_as_of" timestamp(3) with time zone;
  ALTER TABLE "smart_money_reports" ADD COLUMN "flows_basis" varchar DEFAULT 'Trailing 4 weeks';
  ALTER TABLE "smart_money_reports" ADD COLUMN "ai_summary" varchar;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_fii" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_dii" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_promoter" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_technical" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_fundamental" numeric;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_as_of" timestamp(3) with time zone;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_flows_basis" varchar DEFAULT 'Trailing 4 weeks';
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_ai_summary" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "flow_tape_heading" varchar DEFAULT 'Latest institutional activity';
  ALTER TABLE "site_settings" ADD COLUMN "flow_indicator_explainer" varchar DEFAULT 'Flow indicators run from -100 to +100 and show net direction of activity over the stated period. A positive figure means net buying was observed. It is not a score, a rating, or a forecast.' NOT NULL;`)
}
