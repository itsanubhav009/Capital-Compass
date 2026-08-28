# Applying this patch

Unzip over `/workspaces/Capital-Compass`, then run through these in order.

## 1. Delete the old section route

It is replaced by `[slug]`, which handles sections *and* pages. Leaving both
in place is a Next.js route conflict and the build will fail.

```bash
rm -rf 'src/app/(frontend)/[section]'
```

## 2. Add the two query helpers

Append the contents of `QUERIES_ADDITION.ts` to the end of `src/lib/queries.ts`,
then delete `QUERIES_ADDITION.ts`.

## 3. Replace the sitemap

Copy `SITEMAP_REPLACEMENT.ts` over `src/app/(frontend)/sitemap.ts` (drop the
first comment line), then delete `SITEMAP_REPLACEMENT.ts`.

```bash
tail -n +2 SITEMAP_REPLACEMENT.ts > 'src/app/(frontend)/sitemap.ts'
rm SITEMAP_REPLACEMENT.ts QUERIES_ADDITION.ts
```

## 4. Add the seed script

In `package.json`, add to `scripts`:

```json
"seed:pages": "tsx src/scripts/seed-pages.ts"
```

## 5. Migrate and seed

Two new collections means a new migration.

```bash
npm run migrate:create add_pages_and_contact
npm run migrate
npm run seed:pages
```

## 6. Media storage

Create a Cloudflare R2 bucket (or S3). In R2: Create bucket, then
R2 → Manage API Tokens → Create token with Object Read & Write.

Add to `.env` and to Vercel:

```
S3_BUCKET=capital-compass-media
S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

Enable public access on the bucket and note the public URL, then add its
hostname to `next.config.mjs`:

```js
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: 'pub-xxxx.r2.dev' },
  ],
},
```

The S3 plugin only activates when `S3_BUCKET` is set, so local development
keeps writing to disk until you fill these in.

## 7. Commit

```bash
git add -A
git commit -m "Add pages, contact form, S3 media storage"
git push
```
