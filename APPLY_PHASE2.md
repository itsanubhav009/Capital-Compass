# Phase 2 — AI search (Gemini)

Retrieval-augmented generation over the article archive. pgvector on the
Postgres you already have, embeddings written on save, retrieval plus Gemini at
query time.

## 1. Get a key

[aistudio.google.com](https://aistudio.google.com) → Get API key. The free tier
covers both embeddings and generation at this volume.

**Know what the free tier costs you.** Google's free AI Studio tier permits use
of submitted content to improve their products. For a publication, that means
your articles and your readers' questions. If that is not acceptable to the
client, enable billing on the project — the paid tier excludes training use,
and at your volume the bill will be pennies. Worth a one-line email to the
client either way, because it is their content.

## 2. Dependencies

```bash
npm install pg
npm install -D @types/pg
```

## 3. Environment

Add to `.env` and Vercel:

```
GEMINI_API_KEY=              # Secret
GEMINI_EMBED_MODEL=text-embedding-004   # Config
GEMINI_CHAT_MODEL=gemini-2.0-flash      # Config
GEMINI_EMBED_DIMS=768                   # Config
```

Verify both model names in AI Studio before deploying — these were current at
time of writing, but Google's lineup moves quickly. **If you change the
embedding model, its dimension count almost certainly changes too**; update
`GEMINI_EMBED_DIMS`, drop the table, and re-run setup and backfill. Mismatched
dimensions fail at insert with a confusing error.

## 4. Register the hooks

In `SmartMoneyReports.ts`, `MacroNotes.ts`, `ThemeReports.ts` and
`WealthArticles.ts`, add:

```ts
import { indexOnChange, deindexOnDelete } from '../hooks/search-index'
```

and add this key to each `CollectionConfig`, next to `access`:

```ts
  hooks: {
    afterChange: [indexOnChange],
    afterDelete: [deindexOnDelete],
  },
```

## 5. Add the scripts

In `package.json`:

```json
"search:setup": "tsx src/scripts/setup-vector.ts",
"search:backfill": "tsx src/scripts/backfill-embeddings.ts"
```

## 6. Set up the database

Neon supports pgvector natively — nothing to enable in their dashboard.

```bash
npx dotenv -e .env -- npm run search:setup
npx dotenv -e .env -- npm run search:backfill
```

## 7. Swap the placeholder into the homepage

In `src/app/(frontend)/page.tsx`, replace the `AiSearchSlot` import with:

```ts
import { AiSearch } from '@/components/ai-search'
```

and replace `<AiSearchSlot />` with `<AiSearch />`.

Keep the `showAiSearchPlaceholder` toggle in Site Settings wired up — it now
controls whether search appears at all, which is useful for switching it off
quickly.

## 8. Verify

```bash
npm run build
```

After deploying, ask three things:

1. **Something covered by your articles** — should answer with citations
2. **Something not in the archive** — should say so rather than inventing
3. **"Should I buy Reliance?"** — should refuse and point to a registered adviser

Re-run test three every time you change the model or the prompt. It is the
check that matters.

## Notes specific to Gemini

**taskType is not optional.** Documents are embedded with
`RETRIEVAL_DOCUMENT` and queries with `RETRIEVAL_QUERY`, into deliberately
different spaces. Mixing them measurably degrades retrieval. The library
handles this; do not "simplify" it away.

**768 dimensions, not 1536.** `text-embedding-004` is half the width of
OpenAI's small model. Retrieval quality at this corpus size is comparable and
the index is smaller.

**Similarity threshold is 0.45**, higher than the 0.25 that suits OpenAI
embeddings, because Gemini's cosine scores cluster higher. If search returns
irrelevant results, raise it; if it says "nothing covers that" too often, lower
it. The constant is `MIN_SIMILARITY` in the route.

**Free tier rate limits are real.** The embed function batches at 50 and backs
off on 429 up to five times. A large backfill will be slow rather than failing.

**Empty responses.** Gemini can return no candidate when its safety filters
fire. Financial text rarely triggers them, but the route handles it explicitly
rather than rendering a blank answer.

## The compliance design

The system prompt in `src/app/api/search/route.ts` forbids investment advice,
price prediction, and answering from anything but retrieved excerpts, and
requires a citation on every claim. The UI carries a disclaimer under every
answer.

Two limits worth knowing:

- **A system prompt is a strong control, not a guarantee.** Determined prompt
  injection can sometimes get around it. Review search logs for the first few
  months.
- **The model can misread an excerpt.** Citations exist so a reader can check.
  That is why every answer links its sources.
