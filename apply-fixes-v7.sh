\
#!/usr/bin/env bash
set -euo pipefail

echo "== Seat-BA Fix Pack v7 =="
ROOT="$(pwd)"
FILE="app/api/cases/[id]/route.ts"

if [[ ! -f "$ROOT/$FILE" ]]; then
  echo "ERROR: $FILE not found in $ROOT"
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.fix-backup-$TS"
mkdir -p "$BACKUP_DIR"
cp -a "$ROOT/$FILE" "$BACKUP_DIR/route.ts.bak"

echo "Patching $FILE (backup: $BACKUP_DIR/route.ts.bak)"

# Next.js 15 route handler context typing expects params to be a Promise
# of a record-like object (string keys -> string|string[] values).
# We keep `id: string` explicitly but also add an index signature to satisfy the constraint.
CTX_TYPE='ctx: { params: Promise<{ id: string; [key: string]: string | string[] }> }'

perl -0777 -i -pe '
  my $ctx = $ENV{"CTX_TYPE"};

  # Replace destructured params with ctx typed as Promise params
  s/,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string\s*;?\s*\}\s*;?\s*\}/, $ctx/g;

  # Replace any custom Ctx type annotation for ctx/context
  s/,\s*(?:ctx|context)\s*:\s*Ctx\b/, $ctx/g;

  # Replace inline object type that has params.id string
  s/,\s*(?:ctx|context)\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string\s*;?\s*\}\s*;?\s*\}/, $ctx/g;
' CTX_TYPE="$CTX_TYPE" "$ROOT/$FILE"

# Remove leftover "Ctx" type alias/interface if exists (only in this file).
perl -0777 -i -pe '
  s/\n\s*type\s+Ctx\s*=\s*\{.*?\}\s*;\s*\n/\n/sg;
  s/\n\s*interface\s+Ctx\s*\{.*?\}\s*\n/\n/sg;
' "$ROOT/$FILE"

# Ensure each handler has access to a concrete params object (so existing code can keep using params.id).
if ! grep -q "await[[:space:]]\+ctx\.params" "$ROOT/$FILE"; then
  perl -0777 -i -pe '
    s/(export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^\)]*\)\s*\{\n)/$1  \/\/ Next.js 15 passes dynamic route params as a Promise in route handlers.\n  const params = await ctx.params;\n/g;
  ' "$ROOT/$FILE"
fi

echo "✓ Done."
echo "Now run:"
echo "  rm -rf .next"
echo "  npm run build"
