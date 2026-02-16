\
#!/usr/bin/env bash
set -euo pipefail

# Seat-BA Fix Pack v6
# Fix Next.js Route Handler type error:
# "Type 'Ctx' is not a valid type for the function's second argument."
# We replace the named context type (Ctx) with an inline context type
# and adjust references from ctx/context -> params.

ROOT="$(pwd)"
TARGET="app/api/cases/[id]/route.ts"

if [[ ! -f "$ROOT/$TARGET" ]]; then
  echo "ERROR: Could not find $TARGET in $ROOT"
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$STAMP"
mkdir -p "$BACKUP_DIR"
cp -a "$ROOT/$TARGET" "$BACKUP_DIR/route.ts.bak"

echo "== Seat-BA Fix Pack v6 =="
echo "Project root: $ROOT"
echo "Target file:  $TARGET"
echo "Backup:       $BACKUP_DIR/route.ts.bak"

# 1) Remove a named Ctx type/interface if present.
#    We keep it simple: delete blocks starting with 'type Ctx' up to the next ';'
#    or 'interface Ctx' up to the next '}'.
perl -0777 -i -pe '
  s/\n\s*type\s+Ctx\s*=\s*[^;]*;\s*//gms;
  s/\n\s*interface\s+Ctx\s*\{[^}]*\}\s*//gms;
' "$ROOT/$TARGET"

# 2) Replace function second-argument annotation "ctx: Ctx" or "context: Ctx"
#    with an inline context type accepted by Next.js.
#    We do NOT assume NextRequest/Request naming; we only patch the second arg.
perl -0777 -i -pe '
  s/,\s*ctx\s*:\s*Ctx\s*\)/, { params }: { params: { id: string } })/gms;
  s/,\s*context\s*:\s*Ctx\s*\)/, { params }: { params: { id: string } })/gms;

  s/,\s*ctx\s*:\s*Ctx\s*\{/,\n  { params }: { params: { id: string } }\n){/gms;
  s/,\s*context\s*:\s*Ctx\s*\{/,\n  { params }: { params: { id: string } }\n){/gms;
' "$ROOT/$TARGET"

# 3) Replace ctx/context param references to use 'params' directly.
perl -0777 -i -pe '
  s/\bctx\.params\b/params/gm;
  s/\bcontext\.params\b/params/gm;
' "$ROOT/$TARGET"

echo "✓ Patched $TARGET"
echo
echo "Next steps:"
echo "  rm -rf .next"
echo "  npm run build"
