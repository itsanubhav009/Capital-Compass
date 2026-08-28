#!/usr/bin/env bash
# Run from inside /workspaces/Capital-Compass
set -e

echo "1. removing junk and stale installs"
rm -rf 'src/{collections,fields,lib,components}' node_modules package-lock.json

echo "2. installing pinned versions"
npm install

echo "3. env"
[ -f .env ] || cp .env.example .env
grep -q 'PAYLOAD_SECRET=change-me' .env && \
  sed -i "s|PAYLOAD_SECRET=.*|PAYLOAD_SECRET=$(openssl rand -base64 32)|" .env && \
  echo "   generated PAYLOAD_SECRET"

echo
echo "Now edit .env and set DATABASE_URI, then run:"
echo "  npm run generate:importmap"
echo "  npm run migrate:create initial"
echo "  npm run migrate"
echo "  npm run seed"
echo "  npm run dev"
