#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"

# If user executed the script from inside the pack folder, jump to project root.
if [[ ! -f "$ROOT/package.json" ]]; then
  MAYBE_ROOT="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd || true)"
  if [[ -n "$MAYBE_ROOT" && -f "$MAYBE_ROOT/package.json" ]]; then
    ROOT="$MAYBE_ROOT"
  fi
fi

if [[ ! -f "$ROOT/package.json" ]]; then
  echo "[FixPack v4] ERROR: package.json not found. Run this from your project root (e.g. /var/www/seat-ba)." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$STAMP"
mkdir -p "$BACKUP_DIR"

TARGET="$ROOT/app/api/admin/cases/[id]/route.ts"
SRC="$(cd "$(dirname "$0")" && pwd)/reference-files/app/api/admin/cases/[id]/route.ts"

if [[ ! -f "$TARGET" ]]; then
  echo "[FixPack v4] ERROR: target file not found: $TARGET" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
cp -a "$TARGET" "$BACKUP_DIR/route.ts.bak" || true
cp -a "$SRC" "$TARGET"

echo "== Seat-BA Fix Pack v4 =="
echo "Project root: $ROOT"
echo "Backup:       $BACKUP_DIR"
echo "✓ Patched:    app/api/admin/cases/[id]/route.ts"
echo ""
echo "Now run:"
echo "  npm run build"
