import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'
import os from 'os'
import config from '../payload.config'

/**
 * Attach a featured image to every published article that lacks one.
 *  npm run seed:images
 *
 * Split out from seed-demo because image upload is the slow, failure-prone
 * half of that job. This is resumable: run it as many times as needed and it
 * only touches articles still missing an image.
 */

const COLLECTIONS = [
  'smart-money-reports',
  'macro-notes',
  'theme-reports',
  'wealth-articles',
] as const

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function download(seed: number): Promise<string | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`https://picsum.photos/seed/cc${seed}/1600/900`)
      if (!res.ok) throw new Error(String(res.status))
      const buf = Buffer.from(await res.arrayBuffer())
      const file = path.join(os.tmpdir(), `cc-img-${seed}.jpg`)
      fs.writeFileSync(file, buf)
      return file
    } catch {
      await sleep(800 * attempt)
    }
  }
  return null
}

const run = async () => {
  const payload = await getPayload({ config })

  let seed = 100
  let done = 0
  let failed = 0

  for (const collection of COLLECTIONS) {
    const res = await payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      limit: 200,
      depth: 0,
    })

    for (const doc of res.docs as any[]) {
      if (doc.featuredImage) continue

      seed += 1
      const file = await download(seed)
      if (!file) {
        console.log(`  skip   ${doc.slug} (download failed)`)
        failed += 1
        continue
      }

      try {
        const media = await payload.create({
          collection: 'media',
          data: { alt: doc.title },
          filePath: file,
        })

        await payload.update({
          collection,
          id: doc.id,
          data: { featuredImage: media.id },
        })

        done += 1
        console.log(`  image  ${collection}/${doc.slug}`)
      } catch (err) {
        failed += 1
        console.log(`  FAILED ${doc.slug}: ${(err as Error).message.slice(0, 120)}`)
      } finally {
        try {
          fs.unlinkSync(file)
        } catch {}
      }

      // Breathing room: Neon drops idle connections, and R2 is happier not
      // being hammered. Re-run the script if it still dies partway.
      await sleep(400)
    }
  }

  console.log(`\n${done} images attached, ${failed} failed.`)
  if (failed) console.log('Re-run to retry the failures — it only touches articles still missing an image.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
