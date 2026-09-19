import fs from 'fs'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Copy the four old content collections into Articles.
 *
 * Idempotent on slug: rerunning skips anything already carried over, so a
 * failure halfway through can be resumed rather than producing duplicates.
 * The body lives under a different key in three of the four, hence `body ??
 * commentary ?? outlook`.
 */
const SOURCES = ['smart-money-reports', 'macro-notes', 'theme-reports', 'wealth-articles'] as const

const run = async () => {
  const payload = await getPayload({ config })
  const report: any[] = []
  let copied = 0, skipped = 0, failed = 0

  for (const from of SOURCES) {
    const res = await payload.find({
      collection: from, limit: 500, depth: 0, draft: true, overrideAccess: true,
    })
    for (const d of res.docs as any[]) {
      const existing = await payload.find({
        collection: 'articles', where: { slug: { equals: d.slug } },
        limit: 1, draft: true, overrideAccess: true,
      })
      if (existing.docs.length) { skipped++; continue }

      const data: any = {
        title: d.title,
        slug: d.slug,
        section: typeof d.section === 'object' ? d.section?.id : d.section,
        publishedAt: d.publishedAt,
        featured: d.featured ?? false,
        readingMinutes: d.readingMinutes ?? undefined,
        standfirst: d.standfirst ?? undefined,
        featuredImage: typeof d.featuredImage === 'object' ? d.featuredImage?.id : d.featuredImage,
        body: d.body ?? d.commentary ?? d.outlook,
        views: d.views ?? 0,
        // Everything starts visible everywhere, matching how the homepage
        // behaved before placement was controllable.
        placement: { hero: true, rails: true, latest: true, sectionBand: true, sectorThemes: true },
        // Extras, carried across only where the source had them.
        region: d.region ?? undefined,
        assetClass: d.assetClass ?? undefined,
        impact: d.impact ?? undefined,
        impactNote: d.impactNote ?? undefined,
        theme: typeof d.theme === 'object' ? d.theme?.id : d.theme,
        industry: d.industry ?? undefined,
        capitalFlowTrend: d.capitalFlowTrend ?? undefined,
        keyStocks: d.keyStocks ?? undefined,
        tags: d.tags ?? undefined,
        references: d.references ?? undefined,
        charts: d.charts ?? undefined,
        _status: d._status ?? 'draft',
      }
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

      try {
        const made = await payload.create({
          collection: 'articles',
          data,
          draft: data._status !== 'published',
          overrideAccess: true,
        })
        copied++
        report.push({ from, slug: d.slug, status: data._status, newId: (made as any).id })
      } catch (e: any) {
        failed++
        report.push({ from, slug: d.slug, error: e?.message })
        console.error(`  FAIL ${from}/${d.slug}: ${e?.message}`)
      }
    }
  }

  fs.writeFileSync(
    `backups/${new Date().toISOString().slice(0, 10)}-articles-migration.json`,
    JSON.stringify({ at: new Date().toISOString(), copied, skipped, failed, report }, null, 2),
  )
  console.log(`MIGRATE copied=${copied} skipped=${skipped} failed=${failed}`)
  process.exit(failed ? 1 : 0)
}
run().catch((e) => { console.error('MIGRATE_FAILED:', e?.message || e); process.exit(1) })
