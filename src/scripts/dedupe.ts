import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Remove the three original sample articles.  npm run seed:dedupe
 *
 * seed.ts created three placeholders before the demo content existed, and they
 * now duplicate real demo articles on the homepage. Deleting by exact slug so
 * nothing else can be caught by accident.
 */
const OLD = [
  ['smart-money-reports', 'foreign-funds-large-cap-financials-august'],
  ['macro-notes', 'dollar-softened-indian-assets'],
  ['theme-reports', 'data-centre-build-out-capital'],
] as const

const run = async () => {
  const payload = await getPayload({ config })

  for (const [collection, slug] of OLD) {
    const res = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (!res.docs.length) {
      console.log(`  absent ${slug}`)
      continue
    }
    await payload.delete({ collection, id: (res.docs[0] as any).id })
    console.log(`  delete ${collection}/${slug}`)
  }

  console.log('\nDone. Restart the dev server to clear the page cache.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
