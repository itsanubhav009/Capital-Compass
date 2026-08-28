# Capital Compass

Next.js 15 (App Router) + Payload CMS 3 in a single repo. Postgres for data,
Tailwind v4 for styling.

One codebase, one deploy, one admin panel at `/admin`.

---

## Get it running

Payload's App Router boilerplate (the `src/app/(payload)/` route group) changes
between minor versions, so generate it rather than hand-writing it:

```bash
npx create-payload-app@latest capital-compass --template blank --db postgres
```

Then copy this repo's `src/collections`, `src/globals`, `src/fields`,
`src/lib`, `src/components`, `src/scripts`, `src/payload.config.ts` and
`src/app/(frontend)` over the generated ones, and merge `package.json`
dependencies.

```bash
cp .env.example .env      # fill in DATABASE_URI and PAYLOAD_SECRET
npm install
npx payload migrate:create initial
npm run migrate
npm run seed              # sections, sectors, themes, owner login, 3 samples
npm run dev
```

- Site — http://localhost:3000
- Admin — http://localhost:3000/admin
- Seeded login — `owner@capitalcompass.com` / `ChangeThisOnFirstLogin!`

**Change that password before the site is reachable from the internet.**

After any change to a collection, run `npm run generate:types` to refresh
`src/payload-types.ts`, then replace the `any` casts in `src/lib/queries.ts`
with the generated types.

---

## How the content model works

The one architectural decision worth understanding: **navigation is driven by
the `sections` taxonomy, not by post type.**

The brief's menu labels and its post types don't line up. "Smart Money
Insights" needs to pull from several post types at once; "Capital Flow –
International" pulls from two. So every content collection carries a
`section` relationship, and `/[section]/page.tsx` queries across all four
collections filtered by that field.

The practical effect: the client can add, rename or reorder menu items from
the admin panel. No developer, no deploy.

| Collection | What it holds | Brief reference |
|---|---|---|
| `smart-money-reports` | Company-level institutional and promoter activity | §5 |
| `macro-notes` | Region and asset-class macro commentary | §5 |
| `theme-reports` | Sector and theme capital rotation | §5 |
| `wealth-articles` | General editorial | §5 |
| `sections` | The navigation spine | §3 |
| `sectors`, `themes` | Supporting taxonomies | §3 |

### Flow indicators, and why they are signed

The RFP asks for FII Score, DII Score, Promoter Score, Technical Score and
Fundamental Score. A score out of ten displayed beside a ticker reads as a
rating, and §1 forbids anything resembling a recommendation.

These are stored as **signed values from -100 to +100** and rendered on a
centre-zero axis: the bar grows right for net buying, left for net selling.
That describes observed activity over a stated period rather than expressing a
view. Every report carries the period it was measured over, the date it was
measured, and a fixed explainer.

Do not convert these to an unsigned 0–10 scale without legal sign-off.

---

## Where things live

```
src/
  payload.config.ts          collections, globals, db, SEO plugin
  collections/               the four content types + taxonomies + media + users
  globals/SiteSettings.ts    all editable site copy, disclaimers, newsletter text
  fields/common.ts           slug, section, publishing, flow score, references
  lib/queries.ts             cross-collection reads (the section spine)
  lib/format.ts              signed numbers, crore formatting, dates
  components/flow.tsx        FlowBar, FlowPanel, FlowTape, impact/trend marks
  components/site.tsx        header, footer, cards, newsletter, exit intent
  app/(frontend)/
    page.tsx                 homepage — all six §4 modules
    [section]/page.tsx       every menu item, one route
    insight/[slug]/page.tsx  every article type, one route
    sitemap.ts / robots.ts   technical SEO
  app/api/subscribe/route.ts Beehiiv, rate-limited, key stays server-side
  scripts/seed.ts            first-run data
design-preview.html          static design mock — open in any browser
```

---

## Brief coverage

| Requirement | Status |
|---|---|
| §4 Philosophy statement | Editable in Site settings → Homepage |
| §4 Institutional activity strip | `FlowTape` — static grid, not a ticker |
| §4 Macro Snapshot | Homepage module, driven by `impact` field |
| §4 Sector Themes | Homepage module, driven by `capitalFlowTrend` |
| §4 Featured Insights | `featured` checkbox on any post type |
| §4 Newsletter signup | Homepage, footer, exit-intent |
| §4 Reserved AI search slot | `AiSearchSlot`, labelled "Coming in Phase 2" |
| §5 Four post types + fields | All four, with per-type single templates |
| §8 Technical SEO | `generateMetadata`, sitemap, robots, OG, Twitter, JSON-LD |
| §8 Responsive | Mobile-first throughout; skip link and focus states included |
| §7 Out of scope | No AI search, PWA, accounts or payments — as specified |

**Not built yet, and needed before launch:** About, Contact, Disclaimer,
Privacy and Terms pages (the footer links to them), a Payload `Pages`
collection to hold them, and analytics.

---

## Hitting the speed targets (§8: 85+ mobile, 90+ desktop)

Already handled: server components throughout, no client JS on the homepage
except the newsletter form, `next/font` with no render-blocking CSS, WebP
generated on upload at four sizes, `priority` on the lead image only, no
carousels or tickers.

Still on you:

1. **Put Cloudflare in front of the origin.** The audience is in Dubai,
   Singapore, London and New York. Origin location matters less than edge
   coverage, but pick Mumbai or Singapore since the content is India-focused.
2. **Move media to S3 or R2** via `@payloadcms/storage-s3` before deploying
   anywhere with an ephemeral filesystem. Local disk uploads will vanish.
3. **Cap the font loading.** Three families are in use. If mobile scores come
   in under target, drop IBM Plex Mono and set `.tnum` to a system monospace
   stack.
4. **Check the flow tape query.** It is the only homepage query touching
   several collections; add an index on `published_at` if it shows up slow.

---

## Deploying

Vercel is the least work: connect the repo, add the environment variables, add
a Postgres database (Neon or Supabase both work). Set
`NEXT_PUBLIC_SITE_URL` to the production domain or canonicals and the sitemap
will point at localhost.

For a VPS or Cloudways box, `npm run build && npm start` behind nginx, with a
process manager. Media must be on S3 or R2 in that setup.

---

## Ownership

Payload is MIT-licensed and self-hosted, so the database and all content
structures sit on infrastructure the client controls. That satisfies §9
without a licence-back or a vendor holding the content. If you swap in a
hosted CMS later, re-read §9 first.
