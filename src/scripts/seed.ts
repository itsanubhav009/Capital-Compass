import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Run once after `payload migrate`:  npm run seed
 *
 * Creates the six navigation sections from the client's brief, the sector and
 * theme lists from the RFP, an owner login, and three sample articles so the
 * homepage has something to render on Day 1.
 */

const SECTIONS = [
  {
    title: 'Capital Flow – India',
    slug: 'capital-flow-india',
    navOrder: 10,
    accent: 'deep',
    blurb:
      'What foreign institutions, domestic funds, mutual funds and promoters bought and sold in Indian equities.',
  },
  {
    title: 'Capital Flow – International',
    slug: 'capital-flow-international',
    navOrder: 20,
    accent: 'ink',
    blurb: 'Cross-border money movement and how it lands on Indian assets.',
  },
  {
    title: 'Global Macro',
    slug: 'global-macro',
    navOrder: 30,
    accent: 'brass',
    blurb: 'Rates, currencies, commodities and the macro backdrop that sets the tone for flows.',
  },
  {
    title: 'Sectoral Trends',
    slug: 'sectoral-trends',
    navOrder: 40,
    accent: 'inflow',
    blurb: 'Where capital is rotating: AI, defence, renewables, infrastructure, data centres.',
  },
  {
    title: 'Smart Money Insights',
    slug: 'smart-money-insights',
    navOrder: 50,
    accent: 'deep',
    blurb: 'The flagship Weekly Capital Flow Report and longer cross-cutting analysis.',
  },
]

const SECTORS = [
  'Financials',
  'Information Technology',
  'Energy',
  'Industrials',
  'Consumer',
  'Healthcare',
  'Materials',
  'Utilities',
  'Real Estate',
  'Telecom',
]

const THEMES = [
  'Artificial Intelligence',
  'Defence',
  'Renewable Energy',
  'Infrastructure',
  'Manufacturing',
  'Data Centres',
  'Semiconductors',
]

const para = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
        ],
      },
    ],
  },
})

const run = async () => {
  const payload = await getPayload({ config })

  // --- sections -----------------------------------------------------------
  const sectionIds: Record<string, any> = {}
  for (const s of SECTIONS) {
    const existing = await payload.find({
      collection: 'sections',
      where: { slug: { equals: s.slug } },
      limit: 1,
    })
    const doc = existing.docs.length
      ? existing.docs[0]
      : await payload.create({ collection: 'sections', data: s as any })
    sectionIds[s.slug] = doc.id
    console.log(`section  ${s.title}`)
  }

  // --- taxonomies ---------------------------------------------------------
  const sectorIds: Record<string, any> = {}
  for (const title of SECTORS) {
    const existing = await payload.find({
      collection: 'sectors',
      where: { title: { equals: title } },
      limit: 1,
    })
    const doc = existing.docs.length
      ? existing.docs[0]
      : await payload.create({ collection: 'sectors', data: { title } as any })
    sectorIds[title] = doc.id
  }
  console.log(`sectors  ${SECTORS.length}`)

  const themeIds: Record<string, any> = {}
  for (const title of THEMES) {
    const existing = await payload.find({
      collection: 'themes',
      where: { title: { equals: title } },
      limit: 1,
    })
    const doc = existing.docs.length
      ? existing.docs[0]
      : await payload.create({ collection: 'themes', data: { title } as any })
    themeIds[title] = doc.id
  }
  console.log(`themes   ${THEMES.length}`)

  // --- owner --------------------------------------------------------------
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (!users.docs.length) {
    await payload.create({
      collection: 'users',
      data: {
        name: 'Site owner',
        email: 'owner@capitalcompass.com',
        password: 'ChangeThisOnFirstLogin!',
        role: 'owner',
        byline: 'Capital Compass',
      } as any,
    })
    console.log('user     owner@capitalcompass.com / ChangeThisOnFirstLogin!')
  }

  // --- sample content -----------------------------------------------------
  const reports = await payload.find({ collection: 'smart-money-reports', limit: 1 })
  if (!reports.docs.length) {
    await payload.create({
      collection: 'smart-money-reports',
      data: {
        title: 'Foreign funds kept adding to large-cap financials through August',
        slug: 'foreign-funds-large-cap-financials-august',
        section: sectionIds['capital-flow-india'],
        stockName: 'Sample Bank Ltd',
        ticker: 'SAMPLEBANK',
        exchange: 'NSE',
        sector: sectorIds['Financials'],
        marketCapBand: 'Large cap',
        marketCapCr: 412000,
        featured: true,
        readingMinutes: 6,
        standfirst:
          'A fourth straight month of net foreign buying, while domestic funds trimmed at the margin. The gap between the two is the story.',
        aiSummary:
          'Foreign institutional investors were net buyers for a fourth consecutive month. Domestic institutions were mild net sellers over the same window. Promoter holding was unchanged. Placeholder copy — replace before launch.',
        flows: {
          fii: 62,
          dii: -18,
          promoter: 0,
          technical: 34,
          fundamental: 41,
          asOf: new Date().toISOString(),
          basis: 'Trailing 4 weeks',
        },
        body: para(
          'Replace this with the real write-up. This sample exists so the templates render on Day 1.',
        ),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      } as any,
    })

    await payload.create({
      collection: 'macro-notes',
      data: {
        title: 'The dollar softened again, and Indian assets felt it',
        slug: 'dollar-softened-indian-assets',
        section: sectionIds['global-macro'],
        region: 'Global',
        assetClass: 'Currencies',
        impact: 'positive',
        impactNote: 'A weaker dollar has historically preceded stronger EM inflows.',
        readingMinutes: 4,
        standfirst: 'What a softer dollar tends to mean for foreign flows into India.',
        summary: 'Placeholder summary — replace before launch.',
        commentary: para('Replace with the real commentary.'),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      } as any,
    })

    await payload.create({
      collection: 'theme-reports',
      data: {
        title: 'Data centre build-out is pulling in capital faster than power supply can follow',
        slug: 'data-centre-build-out-capital',
        section: sectionIds['sectoral-trends'],
        theme: themeIds['Data Centres'],
        industry: 'Digital infrastructure',
        capitalFlowTrend: 'accelerating',
        readingMinutes: 8,
        standfirst:
          'Announced capacity keeps climbing. The constraint has quietly moved from land to grid connections.',
        keyStocks: [{ name: 'Sample Infra Ltd', ticker: 'SAMPLEINF', note: 'Mentioned in analysis' }],
        outlook: para('Replace with the real outlook.'),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      } as any,
    })
    console.log('content  3 sample articles')
  }

  console.log('\nSeed complete. Log in at /admin and change the owner password.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
