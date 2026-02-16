\
#!/usr/bin/env bash
set -euo pipefail

echo "== Seat-BA Fix Pack v10 =="
ROOT="$(pwd)"
echo "Project root: $ROOT"

TARGET="$ROOT/app/admin/(protected)/cases/page.tsx"

if [ ! -f "$TARGET" ]; then
  echo "✗ Target file not found: $TARGET"
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$STAMP"
mkdir -p "$BACKUP_DIR"
cp -f "$TARGET" "$BACKUP_DIR/page.tsx"
echo "Backup: $BACKUP_DIR/page.tsx"

# Replace existing CaseListItem type (added in v9) with expanded version that includes model + updatedAt
perl -0777 -i -pe 's/type\s+CaseListItem\s*=\s*\{.*?\};/type CaseListItem = {\n  id: string;\n  title: string;\n  brand: string;\n  model: string | null;\n  updatedAt: string | number | Date;\n  createdAt?: string | number | Date;\n  status?: string | null;\n};/s' "$TARGET"

# If replacement didn't happen (type not found), insert it after the first import block.
if ! grep -q "type CaseListItem" "$TARGET"; then
  perl -i -pe 'if($.==1){$p=1} END{}' "$TARGET"
  # Insert after the last import line
  awk '
    BEGIN {inserted=0}
    {
      print $0
      if (!inserted && $0 ~ /^import /) { lastImportLine=NR }
      lines[NR]=$0
    }
  ' "$TARGET" >/dev/null

  # Portable insertion using perl: after last consecutive import line
  perl -0777 -i -pe '
    if ($_ !~ /type\s+CaseListItem/s) {
      if ($_ =~ /(^(?:import[^\n]*\n)+)/m) {
        my $imports=$1;
        my $type="\n// NOTE: Keep this type minimal for the table; extend as needed.\n".
                 "type CaseListItem = {\n".
                 "  id: string;\n".
                 "  title: string;\n".
                 "  brand: string;\n".
                 "  model: string | null;\n".
                 "  updatedAt: string | number | Date;\n".
                 "  createdAt?: string | number | Date;\n".
                 "  status?: string | null;\n".
                 "};\n\n";
        $_ =~ s/\Q$imports\E/$imports$type/;
      }
    }
  ' "$TARGET"
fi

echo "✓ Updated CaseListItem in app/admin/(protected)/cases/page.tsx"
echo "Now run: npm run build"
