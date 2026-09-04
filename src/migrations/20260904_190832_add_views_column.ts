import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "smart_money_reports" ADD COLUMN "views" numeric DEFAULT 0;
  ALTER TABLE "_smart_money_reports_v" ADD COLUMN "version_views" numeric DEFAULT 0;
  ALTER TABLE "macro_notes" ADD COLUMN "views" numeric DEFAULT 0;
  ALTER TABLE "_macro_notes_v" ADD COLUMN "version_views" numeric DEFAULT 0;
  ALTER TABLE "theme_reports" ADD COLUMN "views" numeric DEFAULT 0;
  ALTER TABLE "_theme_reports_v" ADD COLUMN "version_views" numeric DEFAULT 0;
  ALTER TABLE "wealth_articles" ADD COLUMN "views" numeric DEFAULT 0;
  ALTER TABLE "_wealth_articles_v" ADD COLUMN "version_views" numeric DEFAULT 0;
  CREATE INDEX "smart_money_reports_views_idx" ON "smart_money_reports" USING btree ("views");
  CREATE INDEX "_smart_money_reports_v_version_version_views_idx" ON "_smart_money_reports_v" USING btree ("version_views");
  CREATE INDEX "macro_notes_views_idx" ON "macro_notes" USING btree ("views");
  CREATE INDEX "_macro_notes_v_version_version_views_idx" ON "_macro_notes_v" USING btree ("version_views");
  CREATE INDEX "theme_reports_views_idx" ON "theme_reports" USING btree ("views");
  CREATE INDEX "_theme_reports_v_version_version_views_idx" ON "_theme_reports_v" USING btree ("version_views");
  CREATE INDEX "wealth_articles_views_idx" ON "wealth_articles" USING btree ("views");
  CREATE INDEX "_wealth_articles_v_version_version_views_idx" ON "_wealth_articles_v" USING btree ("version_views");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "smart_money_reports_views_idx";
  DROP INDEX "_smart_money_reports_v_version_version_views_idx";
  DROP INDEX "macro_notes_views_idx";
  DROP INDEX "_macro_notes_v_version_version_views_idx";
  DROP INDEX "theme_reports_views_idx";
  DROP INDEX "_theme_reports_v_version_version_views_idx";
  DROP INDEX "wealth_articles_views_idx";
  DROP INDEX "_wealth_articles_v_version_version_views_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "smart_money_reports" DROP COLUMN "views";
  ALTER TABLE "_smart_money_reports_v" DROP COLUMN "version_views";
  ALTER TABLE "macro_notes" DROP COLUMN "views";
  ALTER TABLE "_macro_notes_v" DROP COLUMN "version_views";
  ALTER TABLE "theme_reports" DROP COLUMN "views";
  ALTER TABLE "_theme_reports_v" DROP COLUMN "version_views";
  ALTER TABLE "wealth_articles" DROP COLUMN "views";
  ALTER TABLE "_wealth_articles_v" DROP COLUMN "version_views";`)
}
