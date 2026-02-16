#!/usr/bin/env bash
set -euo pipefail

echo "== Seat-BA Fix Pack v8 (Next.js 15 Page params Promise fix) =="

ROOT="${1:-$(pwd)}"
FILE="$ROOT/app/case/[id]/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "✗ Target file not found: $FILE"
  echo "  Run from project root (/var/www/seat-ba) or pass the root path as arg1."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$STAMP"
mkdir -p "$BACKUP_DIR"
cp -a "$FILE" "$BACKUP_DIR/page.tsx.bak"

echo "Project root: $ROOT"
echo "Backup dir:   $BACKUP_DIR"
echo "Patching:     $FILE"

# 1) Next.js 15 generated PageProps types `params` as a Promise
perl -0777 -i -pe 's/params\s*:\s*\{\s*id\s*:\s*string\s*;?\s*\}/params: Promise<{ id: string }>/g' "$FILE"

# 2) Ensure the default-exported page function is async (so we can await params)
perl -0777 -i -pe 's/export\s+default\s+function\s+/export default async function /g' "$FILE"

# 3) Replace direct access params.id with (await params).id
perl -0777 -i -pe 's/\bparams\.id\b/(await params).id/g' "$FILE"

# 4) Add an English comment once (per your instruction)
COMMENT='// NOTE: In Next.js 15, page `params` is typed as a Promise in generated PageProps.'
if ! grep -qF "$COMMENT" "$FILE"; then
  FIRST_LINE="$(head -n 1 "$FILE" || true)"
  if [[ "$FIRST_LINE" == "'use client'"* || "$FIRST_LINE" == '"use client"'* ]]; then
    # Insert after "use client" directive
    awk -v c="$COMMENT" 'NR==1{print; print c; next} {print}' "$FILE" > "$FILE.__tmp" && mv "$FILE.__tmp" "$FILE"
  else
    # Insert at top
    { echo "$COMMENT"; cat "$FILE"; } > "$FILE.__tmp" && mv "$FILE.__tmp" "$FILE"
  fi
fi

echo "✓ Patched app/case/[id]/page.tsx for Next.js 15 typing"
echo
echo "Next steps (run in project root):"
echo "  rm -rf .next"
echo "  npm run build"
echo "  pm2 restart seat-ba --update-env"
