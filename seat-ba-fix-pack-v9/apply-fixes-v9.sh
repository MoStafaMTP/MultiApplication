#!/usr/bin/env bash
set -euo pipefail

echo "== Seat-BA Fix Pack v9 =="
ROOT="$(pwd)"

if [ ! -f "$ROOT/package.json" ]; then
  echo "ERROR: Run this script from your project root (where package.json exists)."
  exit 1
fi

TS_FILE="$ROOT/app/admin/(protected)/cases/page.tsx"
if [ ! -f "$TS_FILE" ]; then
  echo "ERROR: Expected file not found: app/admin/(protected)/cases/page.tsx"
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$TS"
mkdir -p "$BACKUP_DIR"
cp -a "$TS_FILE" "$BACKUP_DIR/page.tsx.bak"

python3 - <<'PY'
from pathlib import Path
import re

root = Path.cwd()
f = root / "app/admin/(protected)/cases/page.tsx"
text = f.read_text(encoding="utf-8")

# 1) Ensure CaseListItem exists (minimal, only what the table uses).
if "type CaseListItem" not in text:
    # Insert after 'use client' (if present) and import block.
    insert_pos = 0

    m = re.search(r'^("use client"|\'use client\');\s*\n', text, re.M)
    if m:
        insert_pos = m.end()

    # Consume consecutive import lines after insert_pos
    m2 = re.search(r'(?:^import[^\n]*\n)+', text[insert_pos:], re.M)
    if m2:
        insert_pos += m2.end()

    type_block = (
        "\n"
        "// NOTE: Keep this type minimal for the table; extend as needed.\n"
        "type CaseListItem = {\n"
        "  id: string;\n"
        "  title: string;\n"
        "  brand: string;\n"
        "  createdAt?: string | Date | null;\n"
        "  status?: string | null;\n"
        "};\n\n"
    )

    text = text[:insert_pos] + type_block + text[insert_pos:]

# 2) Fix implicit any in cases.map((c) => ...)
# Accept a few whitespace variants.
text_new = re.sub(
    r'cases\.map\(\(\s*c\s*\)\s*=>',
    'cases.map((c: CaseListItem) =>',
    text
)

if text_new == text:
    # If the pattern didn't match, fall back to a broader replacement that only touches the first map.
    text_new = text.replace("cases.map((c) =>", "cases.map((c: CaseListItem) =>", 1)

f.write_text(text_new, encoding="utf-8")
print("✓ Patched:", f)
PY

echo "✓ Backup saved to: $BACKUP_DIR"
echo "✓ Updated: app/admin/(protected)/cases/page.tsx"
echo
echo "Next:"
echo "  npm run build"
