#!/usr/bin/env bash
set -e
cd /workspaces/Capital-Compass

echo "==> 1/3  restoring legacy tokens so untouched components keep their colour"
python3 - << 'PYEOF'
import pathlib
p = pathlib.Path('src/app/(frontend)/globals.css')
s = p.read_text()

if '--color-deep' in s:
    print('  skip — already present')
else:
    # Map the old palette onto the new one so components that were not
    # restyled (footer, newsletter, consent, AI search) still render.
    s = s.replace(
        '  --color-inflow: #1d7a55;',
        """  /* Legacy aliases. The footer, newsletter block, consent banner and AI
     search still reference these. Mapped onto the news palette so nothing
     renders unstyled. Remove once every component is restyled. */
  --color-deep: #101012;
  --color-deep-soft: #26262b;
  --color-brass: #f0a500;
  --color-brass-soft: #f7c košik;

  --color-inflow: #1d7a55;""")
    s = s.replace('#f7c košik', '#f7c65a')
    p.write_text(s)
    print('  patched tokens')

s = p.read_text()
if '.eyebrow' in s:
    print('  skip — eyebrow already present')
else:
    s = s.replace('  .meta {', """  /* Old label class, still used by the footer, article rail and AI search. */
  .eyebrow {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-dot);
  }

  .meta {""")
    p.write_text(s)
    print('  patched eyebrow class')
PYEOF

echo "==> 2/3  wiring the new header"
python3 - << 'PYEOF'
import pathlib
p = pathlib.Path('src/app/(frontend)/layout.tsx')
s = p.read_text()

if "components/site-header" in s:
    print('  skip — already wired')
else:
    old = "import { SiteHeader, SiteFooter, NewsletterForm, ExitIntent } from '@/components/site'"
    new = ("import { SiteFooter, NewsletterForm, ExitIntent } from '@/components/site'\n"
           "import { SiteHeader } from '@/components/site-header'")
    if old in s:
        s = s.replace(old, new, 1)
        print('  patched import')
    else:
        print('  FAILED import — paste your layout import line')

    # getInsights for the latest-headline bar
    if 'getInsights' not in s:
        s = s.replace("from '@/lib/queries'", ", getInsights }".join(
            s[s.find("import {"):s.find("from '@/lib/queries'")].rsplit('}', 1)
        ).strip() + " from '@/lib/queries'", 1) if False else s
        s = s.replace('getSections, getSettings }', 'getInsights, getSections, getSettings }', 1)

    old_hdr = '<SiteHeader siteName={s.siteName} sections={sections as any} />'
    new_hdr = """<SiteHeader
          siteName={s.siteName}
          sections={sections as any}
          latest={
            recent.docs[0]
              ? { title: recent.docs[0].title, slug: recent.docs[0].slug }
              : null
          }
          promo={
            <a href="/#newsletter" className="block bg-bar px-6 py-4 text-white">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-dot">
                Free every Sunday
              </span>
              <p className="mt-0.5 text-[18px] font-bold leading-snug">
                The Weekly Capital Flow Report
              </p>
            </a>
          }
        />"""
    if old_hdr in s:
        s = s.replace(old_hdr, new_hdr, 1)
        print('  patched header props')
    else:
        print('  NOTE header tag differs — check it by hand')

    old_fetch = 'const [settings, sections] = await Promise.all([getSettings(), getSections()])'
    new_fetch = ('const [settings, sections, recent] = await Promise.all([\n'
                 '    getSettings(),\n'
                 '    getSections(),\n'
                 '    getInsights({ limit: 1 }),\n'
                 '  ])')
    if old_fetch in s:
        s = s.replace(old_fetch, new_fetch, 1)
        print('  patched data fetch')
    else:
        print('  NOTE fetch line differs — check it by hand')

    p.write_text(s)
PYEOF

echo "==> 3/3  typecheck"
rm -rf .next
npx tsc --noEmit && echo "  types OK"
