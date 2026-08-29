#!/usr/bin/env bash
# Analytics + email wiring. Safe to re-run — every edit checks itself first.
set -e
cd /workspaces/Capital-Compass

echo "==> 1/4  installing email adapter"
npm install @payloadcms/email-nodemailer@3.88.0

echo "==> 2/4  patching source files"
python3 - << 'PYEOF'
import pathlib, sys

def edit(path, changes):
    p = pathlib.Path(path)
    if not p.exists():
        print(f"  MISSING {path}"); return
    s = p.read_text()
    for label, marker, anchor, insert, before in changes:
        if marker in s:
            print(f"  skip    {label} (already present)")
            continue
        if anchor not in s:
            print(f"  FAILED  {label} — anchor not found, edit by hand")
            continue
        s = s.replace(anchor, (insert + anchor) if before else (anchor + insert), 1)
        print(f"  patched {label}")
    p.write_text(s)

# ---- payload.config.ts ----
email_block = """
  // Without this, password reset silently writes to the server log instead of
  // sending. Enabled only when SMTP credentials are present, so local
  // development keeps logging to console.
  ...(useEmail
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM || 'noreply@capitalcompass.com',
          defaultFromName: 'Capital Compass',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),

"""

edit('src/payload.config.ts', [
    ("config import",
     "email-nodemailer",
     "import { s3Storage } from '@payloadcms/storage-s3'",
     "\nimport { nodemailerAdapter } from '@payloadcms/email-nodemailer'",
     False),
    ("useEmail flag",
     "const useEmail",
     "const useS3 = Boolean(process.env.S3_BUCKET)",
     "\nconst useEmail = Boolean(process.env.SMTP_HOST)",
     False),
    ("email adapter",
     "nodemailerAdapter({",
     "  secret: process.env.PAYLOAD_SECRET",
     email_block,
     True),
])

# ---- layout.tsx ----
edit('src/app/(frontend)/layout.tsx', [
    ("layout import",
     "components/analytics",
     "import './globals.css'",
     "import { Analytics, ConsentBanner } from '@/components/analytics'\n",
     True),
    ("verification tag",
     "GOOGLE_SITE_VERIFICATION",
     "    robots: { index: true, follow: true },",
     "\n    verification: process.env.GOOGLE_SITE_VERIFICATION\n      ? { google: process.env.GOOGLE_SITE_VERIFICATION }\n      : undefined,",
     False),
    ("analytics components",
     "<ConsentBanner />",
     "      </body>",
     "        <Analytics />\n        <ConsentBanner />\n",
     True),
])
PYEOF

echo "==> 3/4  appending env template"
if ! grep -q NEXT_PUBLIC_GA_ID .env 2>/dev/null; then
cat >> .env << 'ENVEOF'

# ---- Analytics (leave blank to disable analytics and the consent banner) ----
NEXT_PUBLIC_GA_ID=
GOOGLE_SITE_VERIFICATION=

# ---- Email (Resend) ----
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=
EMAIL_FROM=noreply@capitalcompass.com
ENVEOF
  echo "  appended to .env"
else
  echo "  skip — already there"
fi
cp .env .env.example 2>/dev/null && sed -i 's/^\(DATABASE_URI\|PAYLOAD_SECRET\|SMTP_PASS\|S3_SECRET_ACCESS_KEY\|S3_ACCESS_KEY_ID\|BEEHIIV_API_KEY\)=.*/\1=/' .env.example && echo "  refreshed .env.example with secrets stripped"

echo "==> 4/4  verifying"
rm -rf .next
npm run generate:types
npx tsc --noEmit && echo "  types OK"
npm run build

echo
echo "Done. Review the diff before committing:"
echo "  git diff src/payload.config.ts 'src/app/(frontend)/layout.tsx'"
