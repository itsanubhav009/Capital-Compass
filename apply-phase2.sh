#!/usr/bin/env bash
# Phase 2 — AI search wiring. Safe to re-run; every edit checks itself first.
set -e
cd /workspaces/Capital-Compass

echo "==> 1/5  dependencies"
npm install pg
npm install -D @types/pg

echo "==> 2/5  patching source files"
python3 - << 'PYEOF'
import pathlib, json

# ---- collection hooks -------------------------------------------------
HOOKS = """  hooks: {
    afterChange: [indexOnChange],
    afterDelete: [deindexOnDelete],
  },
"""
IMPORT = "import { indexOnChange, deindexOnDelete } from '../hooks/search-index'\n"

for name in ['SmartMoneyReports', 'MacroNotes', 'ThemeReports', 'WealthArticles']:
    p = pathlib.Path(f'src/collections/{name}.ts')
    if not p.exists():
        print(f"  MISSING {name}.ts"); continue
    s = p.read_text()
    if 'indexOnChange' in s:
        print(f"  skip    {name} (already wired)"); continue

    # import goes after the last existing import line
    lines = s.split('\n')
    last = max(i for i, l in enumerate(lines) if l.startswith('import '))
    lines.insert(last + 1, IMPORT.rstrip('\n'))
    s = '\n'.join(lines)

    # hooks go immediately before the access block
    anchor = '  access: {'
    if anchor not in s:
        print(f"  FAILED  {name} — no access block, add hooks by hand"); continue
    s = s.replace(anchor, HOOKS + anchor, 1)
    p.write_text(s)
    print(f"  patched {name}")

# ---- homepage: swap placeholder for real search -----------------------
p = pathlib.Path('src/app/(frontend)/page.tsx')
if p.exists():
    s = p.read_text()
    if 'AiSearch' in s and 'AiSearchSlot' not in s:
        print("  skip    homepage (already swapped)")
    else:
        s = s.replace('AiSearchSlot, ', '').replace(', AiSearchSlot', '')
        if "from '@/components/ai-search'" not in s:
            lines = s.split('\n')
            last = max(i for i, l in enumerate(lines) if l.startswith('import '))
            lines.insert(last + 1, "import { AiSearch } from '@/components/ai-search'")
            s = '\n'.join(lines)
        s = s.replace('<AiSearchSlot />', '<AiSearch />')
        p.write_text(s)
        print("  patched homepage")

# ---- package.json scripts ---------------------------------------------
p = pathlib.Path('package.json')
cfg = json.loads(p.read_text())
cfg['scripts']['search:setup'] = 'tsx src/scripts/setup-vector.ts'
cfg['scripts']['search:backfill'] = 'tsx src/scripts/backfill-embeddings.ts'
p.write_text(json.dumps(cfg, indent=2) + '\n')
print("  patched package.json")
PYEOF

echo "==> 3/5  env template"
if ! grep -q GEMINI_API_KEY .env 2>/dev/null; then
cat >> .env << 'ENVEOF'

# ---- AI search (Gemini) ----
GEMINI_API_KEY=
GEMINI_EMBED_MODEL=text-embedding-004
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_EMBED_DIMS=768
ENVEOF
  echo "  appended to .env — paste your key into GEMINI_API_KEY now"
else
  echo "  skip — already there"
fi

echo "==> 4/5  typecheck"
rm -rf .next
npx tsc --noEmit && echo "  types OK"

echo "==> 5/5  next steps"
cat << 'NEXT'

  Put your key in .env, then:

    npx dotenv -e .env -- npm run search:setup
    npx dotenv -e .env -- npm run search:backfill
    npm run build

  Then add these to Vercel (Production + Preview):
    GEMINI_API_KEY        Secret
    GEMINI_EMBED_MODEL    Config   text-embedding-004
    GEMINI_CHAT_MODEL     Config   gemini-2.0-flash
    GEMINI_EMBED_DIMS     Config   768

  Review the diff, then commit:
    git diff --stat
    git add -A && git commit -m "Add AI search with Gemini" && git push

NEXT
