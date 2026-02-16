\
#!/usr/bin/env bash
set -euo pipefail

echo "== Seat-BA Fix Pack v5 =="
ROOT="$(pwd)"
echo "Project root: ${ROOT}"

TARGET="app/api/admin/cases/[id]/route.ts"
if [[ ! -f "${TARGET}" ]]; then
  echo "ERROR: ${TARGET} not found. Run this from the project root (/var/www/seat-ba)."
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${ROOT}/.fix-backup-${TS}"
mkdir -p "${BACKUP_DIR}"
cp -a "${TARGET}" "${BACKUP_DIR}/route.ts.bak"

cat > "${TARGET}" <<'EOF'
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/src/lib/auth";
import { deleteCase, getCaseById, updateCase } from "@/src/lib/db";

/**
 * NOTE (Next.js 15):
 * The second argument type of Route Handlers must be an inline object type,
 * not a type alias (e.g., `Ctx`). Otherwise, Next may fail type validation.
 * Also, `params` can be a Promise in newer Next versions, so we `await` it.
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApi(req);
  // If the helper returns a Response, short-circuit.
  if (gate instanceof Response) return gate;

  const { id } = await params;

  const row = await getCaseById(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApi(req);
  if (gate instanceof Response) return gate;

  const { id } = await params;

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    // Body can be empty; keep payload as {}.
  }

  const updated = await updateCase(id, payload);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApi(req);
  if (gate instanceof Response) return gate;

  const { id } = await params;

  await deleteCase(id);
  return NextResponse.json({ ok: true });
}
EOF

echo "✓ Patched ${TARGET}"
echo "Backup saved at: ${BACKUP_DIR}"
echo
echo "Now run:"
echo "  rm -rf .next"
echo "  npm run build"
