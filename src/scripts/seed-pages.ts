import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Creates the six pages the footer links to.  npm run seed:pages
 *
 * Safe to re-run — skips any slug that already exists, so your edits in the
 * admin panel are never overwritten.
 *
 * THE LEGAL TEXT BELOW IS A STARTING DRAFT, NOT LEGAL ADVICE.
 * Have a lawyer review it before launch. See the notes in each page.
 */

type Block = { h?: string; p?: string[] }

const rich = (blocks: Block[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks.flatMap((b) => {
      const nodes: any[] = []
      if (b.h) {
        nodes.push({
          type: 'heading',
          tag: 'h2',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            { type: 'text', text: b.h, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
          ],
        })
      }
      for (const text of b.p ?? []) {
        nodes.push({
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          children: [
            { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
          ],
        })
      }
      return nodes
    }),
  },
})

const PAGES = [
  {
    slug: 'about',
    title: 'About Capital Compass',
    standfirst:
      'We track where large investors put their money, and explain why in plain English.',
    body: rich([
      {
        p: [
          'Capital Compass is a financial publication for people who follow Indian markets closely but do not have an afternoon to spend on filings. Every week, foreign institutions, domestic funds, mutual funds and company promoters leave a documentary trail of what they bought and sold. We read that trail, check it against primary sources, and write up what changed.',
        ],
      },
      {
        h: 'What we do not do',
        p: [
          'We do not give investment advice. We publish no stock tips, no buy or sell calls, no target prices and no portfolio recommendations. Nothing on this site should be read as a suggestion that you take any particular action with your money.',
          'This is a deliberate editorial position rather than a technicality. Describing what large investors did is a different activity from telling you what to do, and we think the first is more useful anyway.',
        ],
      },
      {
        h: 'Who reads us',
        p: [
          'Our readers are largely High Net-worth Individuals and Non-Resident Indians — people who track Indian markets from Dubai, Singapore, London and New York, and who want a fast, sourced read rather than a feed of headlines.',
        ],
      },
      {
        h: 'How we are funded',
        p: [
          'REPLACE THIS SECTION before launch. Readers, and search engines, care about who pays for the work. State plainly whether the site is funded by subscriptions, advertising, sponsorship, or the owner, and disclose any commercial relationships that could affect coverage.',
        ],
      },
    ]),
  },
  {
    slug: 'editorial-standards',
    title: 'Editorial standards',
    standfirst: 'How we source our numbers, and what we do when we get something wrong.',
    body: rich([
      {
        h: 'Where our numbers come from',
        p: [
          'Flow figures are drawn from primary disclosures: exchange filings, quarterly shareholding patterns, FPI investment data published by NSDL, and monthly AUM disclosures from AMFI. Every article lists its sources at the foot of the page, with the date each source was published.',
          'Where we use a secondary source, we say so and link to it. We do not publish figures we cannot attribute.',
        ],
      },
      {
        h: 'What flow indicators mean',
        p: [
          'Flow indicators run from -100 to +100 and describe the net direction of observed activity over a stated period. A positive number means net buying was observed during that window. They are not ratings, not scores out of ten, and carry no view about future prices.',
          'Every report states the period the figures cover and the date they were measured, because a flow figure without a window is meaningless.',
        ],
      },
      {
        h: 'Corrections',
        p: [
          'If we publish something wrong, we correct it on the article itself with a dated note rather than quietly editing the text. Material corrections are noted at the top of the piece.',
          'To report an error, use the contact form and select "Correction or factual dispute". Include the article and the specific figure you are disputing.',
        ],
      },
      {
        h: 'Conflicts of interest',
        p: [
          'REPLACE THIS SECTION before launch. State your policy on staff holding positions in companies you cover, and on accepting payment, gifts or hospitality from companies, funds or PR firms.',
        ],
      },
    ]),
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    standfirst: 'Capital Compass publishes financial journalism. It is not investment advice.',
    body: rich([
      {
        h: 'Not investment advice',
        p: [
          'The content on this site is published for general information only. It does not constitute investment advice, a recommendation, an offer, or a solicitation to buy or sell any security or financial instrument. It takes no account of your financial situation, objectives or risk tolerance.',
          'You should not act on anything published here without seeking independent advice from a suitably qualified and, where applicable, registered adviser.',
        ],
      },
      {
        h: 'Flow indicators are not ratings',
        p: [
          'Flow indicators describe observed institutional and promoter activity over a stated historical period. They are descriptive, not predictive. A positive figure does not mean a security is attractive, and a negative figure does not mean it is unattractive.',
        ],
      },
      {
        h: 'Accuracy',
        p: [
          'We take reasonable care to source figures from primary disclosures, but we do not warrant that the information here is accurate, complete or current. Filings are revised, data providers make errors, and markets move. Verify anything you intend to rely on.',
        ],
      },
      {
        h: 'No liability',
        p: [
          'To the fullest extent permitted by law, Capital Compass and its contributors accept no liability for any loss arising from the use of, or reliance on, anything published on this site.',
        ],
      },
      {
        h: 'Regulatory status',
        p: [
          'REPLACE THIS SECTION before launch, with legal advice. India regulates investment advice and securities research through SEBI, including the Research Analysts and Investment Advisers regulations. Whether a publication needs to register depends on what it actually publishes, and the line between journalism and research is narrower than most publishers assume. Get a securities lawyer to review your actual content before launch, not just this page.',
        ],
      },
    ]),
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    standfirst: 'What we collect, why, and how to get it deleted.',
    body: rich([
      {
        h: 'What we collect',
        p: [
          'If you subscribe to our newsletter, we collect your email address. If you use the contact form, we collect your name, email address, and the content of your message, along with your IP address and browser user agent for abuse prevention.',
          'REPLACE THIS PARAGRAPH once analytics are live, listing exactly which analytics provider you use and what it collects.',
        ],
      },
      {
        h: 'Why we collect it',
        p: [
          'Email addresses are used to send the newsletter you asked for and nothing else. Contact form data is used to reply to you. We do not sell personal data.',
        ],
      },
      {
        h: 'Who we share it with',
        p: [
          'REPLACE THIS SECTION before launch with your actual processors. At minimum this will include your newsletter provider, your hosting provider, and your database provider. Name them and link to their privacy policies.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          'You can unsubscribe from the newsletter using the link in any email. You can ask us to delete the personal data we hold about you by writing to us through the contact form.',
          'REPLACE THIS SECTION with legal advice. Your obligations depend on where you and your readers are. A publication aimed at NRIs will have readers in the EU and UK, which brings GDPR into scope, and India has its own Digital Personal Data Protection Act. These are not the same regime.',
        ],
      },
      {
        h: 'Cookies',
        p: [
          'REPLACE THIS SECTION before launch, describing every cookie the site actually sets. If you add analytics, you will likely need a consent banner for readers in the EU and UK.',
        ],
      },
    ]),
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    standfirst: 'The rules for using this site.',
    body: rich([
      {
        h: 'Acceptance',
        p: [
          'By using this site you agree to these terms. If you do not agree, do not use the site.',
        ],
      },
      {
        h: 'Copyright',
        p: [
          'All content on this site is owned by Capital Compass unless stated otherwise. You may read, share links to, and quote short extracts with attribution. You may not republish articles in full, scrape the site systematically, or use its content to train machine learning models without written permission.',
        ],
      },
      {
        h: 'Acceptable use',
        p: [
          'Do not attempt to gain unauthorised access to the site, disrupt its operation, or use it for any unlawful purpose.',
        ],
      },
      {
        h: 'Changes',
        p: [
          'We may update these terms. The date at the foot of this page shows when they were last reviewed.',
        ],
      },
      {
        h: 'Governing law',
        p: [
          'REPLACE THIS SECTION with legal advice, specifying the governing law and jurisdiction. This matters more than it looks for a publication with readers in several countries.',
        ],
      },
    ]),
  },
  {
    slug: 'contact',
    title: 'Contact',
    standfirst:
      'Corrections, questions about our method, media enquiries. We read everything.',
    body: rich([
      {
        p: [
          'We reply to most messages within two working days. We cannot answer questions about what to buy or sell, and we do not respond to unsolicited PR pitches about individual companies.',
        ],
      },
    ]),
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  for (const page of PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })
    if (existing.docs.length) {
      console.log(`skip   /${page.slug} (already exists)`)
      continue
    }
    await payload.create({
      collection: 'pages',
      data: {
        ...page,
        lastReviewed: new Date().toISOString(),
        _status: 'published',
      } as any,
    })
    console.log(`create /${page.slug}`)
  }

  console.log('\nDone. Every page marked REPLACE THIS SECTION needs real content')
  console.log('and a lawyer before launch.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
