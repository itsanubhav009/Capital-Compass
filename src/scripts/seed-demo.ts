import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'
import os from 'os'
import config from '../payload.config'

/**
 * Demo content.  npm run seed:demo
 *
 * Downloads placeholder photography, uploads it through Payload (so it lands
 * in R2 like real content would), and creates 30 articles spread across every
 * section and content type. Enough to judge the layout properly — the hero
 * grid alone consumes nine.
 *
 * Safe to re-run: skips any slug that already exists.
 *
 * THIS IS DEMO COPY. Delete it before launch:
 *   npm run seed:demo -- --purge
 */

const IMG = (seed: number) => `https://picsum.photos/seed/cc${seed}/1600/900`

type Draft = {
  collection: 'smart-money-reports' | 'macro-notes' | 'theme-reports' | 'wealth-articles'
  section: string
  title: string
  standfirst: string
  extra?: Record<string, any>
}

const DRAFTS: Draft[] = [
  // ---------------------------------------------- Capital Flow – India
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'Foreign funds kept adding to large-cap financials through August',
    standfirst:
      'A fourth straight month of net foreign buying, while domestic funds trimmed at the margin. The gap between the two is the story.',
    extra: { stockName: 'HDFC Bank', ticker: 'HDFCBANK', exchange: 'NSE', marketCapBand: 'Large cap', marketCapCr: 1240000, flows: { fii: 62, dii: -18, promoter: 0, technical: 34, fundamental: 41, basis: 'Trailing 4 weeks' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'Promoter holding slipped for a second quarter at a mid-cap chemicals maker',
    standfirst:
      'Two consecutive quarters of dilution, with no corresponding institutional pickup. Worth watching rather than acting on.',
    extra: { stockName: 'Deepak Nitrite', ticker: 'DEEPAKNTR', exchange: 'NSE', marketCapBand: 'Mid cap', marketCapCr: 31200, flows: { fii: -12, dii: 8, promoter: -44, technical: -21, fundamental: 15, basis: 'Q2 FY26 shareholding' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'Domestic mutual funds took the other side of the foreign selling in IT',
    standfirst:
      'FIIs reduced exposure across the sector while domestic funds absorbed most of it. The absorption has been unusually orderly.',
    extra: { stockName: 'Infosys', ticker: 'INFY', exchange: 'NSE', marketCapBand: 'Large cap', marketCapCr: 642000, flows: { fii: -38, dii: 51, promoter: 0, technical: -9, fundamental: 22, basis: 'Trailing 6 weeks' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'A cement maker saw its first net foreign inflow in eleven months',
    standfirst:
      'Small in absolute terms, but it breaks a run that had been remarkably consistent. Capacity announcements preceded it by three weeks.',
    extra: { stockName: 'UltraTech Cement', ticker: 'ULTRACEMCO', exchange: 'NSE', marketCapBand: 'Large cap', marketCapCr: 318000, flows: { fii: 19, dii: 4, promoter: 0, technical: 27, fundamental: 11, basis: 'Trailing 4 weeks' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'Insurance names drew steady domestic buying without foreign participation',
    standfirst:
      'Domestic institutions have been accumulating for five months. Foreign holdings are effectively unchanged over the same window.',
    extra: { stockName: 'SBI Life', ticker: 'SBILIFE', exchange: 'NSE', marketCapBand: 'Large cap', marketCapCr: 156000, flows: { fii: 3, dii: 47, promoter: 0, technical: 18, fundamental: 29, basis: 'Trailing 5 months' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-india',
    title: 'Heavy net selling at a small-cap logistics operator ahead of results',
    standfirst:
      'Both foreign and domestic institutions reduced. The pattern is unusual enough to note; the reasons are not disclosed anywhere.',
    extra: { stockName: 'TCI Express', ticker: 'TCIEXP', exchange: 'NSE', marketCapBand: 'Small cap', marketCapCr: 3400, flows: { fii: -66, dii: -29, promoter: 0, technical: -48, fundamental: -12, basis: 'Trailing 3 weeks' } },
  },

  // ------------------------------------- Capital Flow – International
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-international',
    title: 'Sovereign funds increased Indian equity allocations for a third quarter',
    standfirst:
      'Disclosures from three Gulf and Singapore funds show consistent addition. Aggregate exposure remains modest against their totals.',
    extra: { stockName: 'Reliance Industries', ticker: 'RELIANCE', exchange: 'NSE', marketCapBand: 'Large cap', marketCapCr: 1980000, flows: { fii: 44, dii: 12, promoter: 0, technical: 22, fundamental: 33, basis: 'Q2 FY26 filings' } },
  },
  {
    collection: 'smart-money-reports',
    section: 'capital-flow-international',
    title: 'US-listed India funds saw their largest weekly inflow since March',
    standfirst:
      'Flow data from the two largest India-focused ETFs shows a sharp reversal after eleven weeks of steady redemptions.',
    extra: { stockName: 'India ETF composite', ticker: 'INDA', exchange: 'Both', marketCapBand: 'Large cap', flows: { fii: 71, dii: 0, promoter: 0, technical: 39, fundamental: 18, basis: 'Trailing week' } },
  },
  {
    collection: 'wealth-articles',
    section: 'capital-flow-international',
    title: 'What the new remittance thresholds mean if you invest from the Gulf',
    standfirst:
      'Changes to reporting requirements affect timing more than tax. Here is what actually shifted and what did not.',
  },
  {
    collection: 'wealth-articles',
    section: 'capital-flow-international',
    title: 'Currency timing is the quiet cost in most NRI portfolios',
    standfirst:
      'The gap between a good and bad conversion window has exceeded most people\u2019s annual return in three of the last five years.',
  },

  // ------------------------------------------------------ Global Macro
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'The dollar softened again, and Indian assets felt it',
    standfirst: 'What a weaker dollar has historically meant for foreign inflows into Indian equities.',
    extra: { region: 'Global', assetClass: 'Currencies', impact: 'positive', impactNote: 'A weaker dollar has historically preceded stronger EM inflows.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'RBI held rates, but the language on liquidity shifted',
    standfirst: 'The policy decision was expected. The change in tone on system liquidity was not.',
    extra: { region: 'India', assetClass: 'Interest rates', impact: 'neutral', impactNote: 'Marginally softer than the previous statement.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'Crude back above eighty-four dollars on supply headlines',
    standfirst: 'A sustained move higher pressures the import bill and, with a lag, the currency.',
    extra: { region: 'Global', assetClass: 'Commodities', impact: 'negative', impactNote: 'A sustained move higher pressures the import bill.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'US earnings breadth narrowed again in the second quarter',
    standfirst: 'Concentration risk is now visible in allocation data, not just in index weights.',
    extra: { region: 'United States', assetClass: 'Equities', impact: 'neutral', impactNote: 'Concentration is showing up in allocation data.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'Chinese stimulus measures drew capital away from other emerging markets',
    standfirst: 'Allocation is close to zero-sum in the short run. India gave up some ground in October.',
    extra: { region: 'China', assetClass: 'Cross-asset', impact: 'negative', impactNote: 'EM allocation is close to zero-sum in the short run.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'The rupee held its range despite a widening trade deficit',
    standfirst: 'Reserve intervention explains part of it. The rest is portfolio inflow doing quiet work.',
    extra: { region: 'India', assetClass: 'Currencies', impact: 'neutral', impactNote: 'Intervention and portfolio inflow are both contributing.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'European rate expectations moved sharply after the inflation print',
    standfirst: 'The repricing was faster than any single data point usually justifies.',
    extra: { region: 'Europe', assetClass: 'Interest rates', impact: 'neutral', impactNote: 'Faster repricing than one print usually justifies.' },
  },
  {
    collection: 'macro-notes',
    section: 'global-macro',
    title: 'Gold held near record levels as central banks kept buying',
    standfirst: 'Official sector demand has now run above the ten-year average for eight consecutive quarters.',
    extra: { region: 'Global', assetClass: 'Commodities', impact: 'neutral', impactNote: 'Official sector demand remains above trend.' },
  },

  // -------------------------------------------------- Sectoral Trends
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Data centre build-out is pulling in capital faster than power supply can follow',
    standfirst: 'Announced capacity keeps climbing. The constraint has quietly moved from land to grid connections.',
    extra: { theme: 'Data Centres', industry: 'Digital infrastructure', capitalFlowTrend: 'accelerating' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Defence order books now stretch into FY29',
    standfirst: 'Execution, not demand, is the binding constraint. Margin guidance across the sector reflects that.',
    extra: { theme: 'Defence', industry: 'Aerospace and defence', capitalFlowTrend: 'accelerating' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Funding costs are biting into renewable project economics',
    standfirst: 'Several announced projects have quietly slipped a quarter. Few have said so publicly.',
    extra: { theme: 'Renewable Energy', industry: 'Power generation', capitalFlowTrend: 'cooling' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Semiconductor incentives are moving from announcement to actual spend',
    standfirst: 'The first tranche of disbursements tells you more than two years of headlines did.',
    extra: { theme: 'Semiconductors', industry: 'Electronics manufacturing', capitalFlowTrend: 'steady' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Contract manufacturing is absorbing capital that used to go to branded consumer',
    standfirst: 'A rotation that has been running for six quarters and is now visible in allocation data.',
    extra: { theme: 'Manufacturing', industry: 'Contract manufacturing', capitalFlowTrend: 'accelerating' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Road and port concessions are drawing a different kind of investor',
    standfirst: 'Pension and infrastructure funds are displacing traditional private equity in the bidding.',
    extra: { theme: 'Infrastructure', industry: 'Transport infrastructure', capitalFlowTrend: 'steady' },
  },
  {
    collection: 'theme-reports',
    section: 'sectoral-trends',
    title: 'Enterprise AI spending is concentrated in far fewer companies than announcements suggest',
    standfirst: 'Disclosed contract values cluster around a handful of vendors. The long tail is mostly pilots.',
    extra: { theme: 'Artificial Intelligence', industry: 'Enterprise software', capitalFlowTrend: 'reversing' },
  },

  // ---------------------------------------------- Smart Money Insights
  {
    collection: 'wealth-articles',
    section: 'smart-money-insights',
    title: 'What the September index rebalance actually changed',
    standfirst: 'Passive flows moved roughly as expected. The active response was the surprise.',
  },
  {
    collection: 'wealth-articles',
    section: 'smart-money-insights',
    title: 'Reading a shareholding pattern without fooling yourself',
    standfirst: 'The four fields most readers misinterpret, and what each one can and cannot tell you.',
  },
  {
    collection: 'wealth-articles',
    section: 'smart-money-insights',
    title: 'Promoter pledging is a signal, but not the one most people think',
    standfirst: 'The level matters far less than the direction and the disclosed purpose.',
  },
  {
    collection: 'wealth-articles',
    section: 'smart-money-insights',
    title: 'Why FII and DII numbers so often point in opposite directions',
    standfirst: 'Different mandates, different funding costs, different time horizons. The divergence is structural.',
  },
  {
    collection: 'wealth-articles',
    section: 'smart-money-insights',
    title: 'The quarterly filing calendar, and why timing your reading matters',
    standfirst: 'Most of the informational value in a shareholding pattern decays within eleven days.',
  },
]

const para = (paras: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paras.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    })),
  },
})

const BODY = para([
  'This is demo copy written to fill the layout so the design can be judged with realistic line lengths. Replace it before launch.',
  'The pattern held through the period under review. Institutional positioning shifted at the margin, and the direction was consistent enough across weekly disclosures to be worth recording. Absolute figures remain modest.',
  'What would change the read is a reversal in the currency, a shift in the rate outlook, or any change in promoter holding. The last of those has historically been the earliest signal in names of this size.',
  'Figures are drawn from exchange filings and the monthly disclosures listed at the foot of this article. Where a figure has been revised since first publication, the revision is noted.',
])

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70)

async function fetchImage(seed: number): Promise<string | null> {
  try {
    const res = await fetch(IMG(seed))
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const file = path.join(os.tmpdir(), `cc-demo-${seed}.jpg`)
    fs.writeFileSync(file, buf)
    return file
  } catch {
    return null
  }
}

const run = async () => {
  const payload = await getPayload({ config })
  const purge = process.argv.includes('--purge')

  if (purge) {
    for (const collection of ['smart-money-reports', 'macro-notes', 'theme-reports', 'wealth-articles'] as const) {
      const res = await payload.find({ collection, limit: 500, depth: 0 })
      for (const doc of res.docs as any[]) {
        await payload.delete({ collection, id: doc.id })
      }
      console.log(`purged ${collection}`)
    }
    console.log('\nAll articles removed.')
    process.exit(0)
  }

  // ---- resolve section and theme ids ------------------------------------
  const sections = await payload.find({ collection: 'sections', limit: 50, depth: 0 })
  const sectionId: Record<string, any> = {}
  for (const s of sections.docs as any[]) sectionId[s.slug] = s.id

  const themes = await payload.find({ collection: 'themes', limit: 50, depth: 0 })
  const themeId: Record<string, any> = {}
  for (const t of themes.docs as any[]) themeId[t.title] = t.id

  if (!Object.keys(sectionId).length) {
    console.error('No sections found. Run "npm run seed" first.')
    process.exit(1)
  }

  let made = 0
  for (let i = 0; i < DRAFTS.length; i++) {
    const d = DRAFTS[i]
    const slug = slugify(d.title)

    const exists = await payload.find({
      collection: d.collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (exists.docs.length) {
      console.log(`  skip  ${slug}`)
      continue
    }

    // ---- image -----------------------------------------------------------
    let mediaId: any = null
    const file = await fetchImage(i + 1)
    if (file) {
      try {
        const m = await payload.create({
          collection: 'media',
          data: { alt: d.title },
          filePath: file,
        })
        mediaId = m.id
        fs.unlinkSync(file)
      } catch (err) {
        console.warn(`  image upload failed for ${slug}: ${(err as Error).message}`)
      }
    }

    // Stagger dates so the archive and hero ordering look natural.
    const published = new Date(Date.now() - i * 1000 * 60 * 60 * 9).toISOString()

    const extra: any = { ...(d.extra ?? {}) }
    if (extra.theme) extra.theme = themeId[extra.theme] ?? undefined
    if (extra.flows) extra.flows = { ...extra.flows, asOf: published }

    const bodyKey =
      d.collection === 'macro-notes' ? 'commentary' : d.collection === 'theme-reports' ? 'outlook' : 'body'

    await payload.create({
      collection: d.collection,
      data: {
        title: d.title,
        slug,
        section: sectionId[d.section],
        standfirst: d.standfirst,
        featuredImage: mediaId,
        publishedAt: published,
        readingMinutes: 4 + (i % 6),
        featured: i < 3,
        views: 40 + ((i * 37) % 160),
        [bodyKey]: BODY,
        ...(d.collection === 'smart-money-reports' ? { aiSummary: d.standfirst } : {}),
        ...(d.collection === 'macro-notes' ? { summary: d.standfirst } : {}),
        ...extra,
        _status: 'published',
      } as any,
    })

    made += 1
    console.log(`  create ${d.collection}/${slug}${mediaId ? '' : ' (no image)'}`)
  }

  console.log(`\n${made} articles created.`)
  console.log('Run "npm run search:backfill" to index them for AI search.')
  console.log('Remove all demo content later with: npm run seed:demo -- --purge')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
