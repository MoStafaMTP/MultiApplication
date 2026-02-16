#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"

echo "== Seat-BA Fix Pack v11 =="
echo "Project root: $ROOT_DIR"

BACKUP_DIR="$ROOT_DIR/.fix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

target="$ROOT_DIR/app/api/admin/change-password/route.ts"
if [[ ! -f "$target" ]]; then
  echo "✗ Could not find: app/api/admin/change-password/route.ts"
  echo "  Current folder: $ROOT_DIR"
  exit 1
fi

cp -a "$target" "$BACKUP_DIR/route.ts"

# Patch: rotateAdminPassword(curr, next) -> rotateAdminPassword(next)
# This matches the current exported function signature in src/lib/auth.ts.
python3 - <<'PY'
import re
from pathlib import Path

p = Path('app/api/admin/change-password/route.ts')
s = p.read_text(encoding='utf-8')

new = s
patterns = [
    r"rotateAdminPassword\(\s*curr\s*,\s*next\s*\)",
    r"rotateAdminPassword\(\s*current\s*,\s*next\s*\)",
]
replaced = False
for pat in patterns:
    if re.search(pat, new):
        new = re.sub(pat, "rotateAdminPassword(next)", new, count=1)
        replaced = True
        break

if not replaced:
    raise SystemExit("No matching rotateAdminPassword(curr, next) call found. File may already be fixed or different.")

p.write_text(new, encoding='utf-8')
print('✓ Patched', p)
PY

echo "✓ Backup saved to: $BACKUP_DIR"
echo "✓ Done. Now run: npm run build"
