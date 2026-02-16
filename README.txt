Seat-BA Fix Pack v7 (No extra folders in your repo)

Fixes:
- app/api/cases/[id]/route.ts
  * Replaces invalid 2nd argument typing with Next.js 15 compatible typing.
  * Uses Promise-based params in route handlers.
  * Adds `const params = await ctx.params;` so existing code can keep using params.id.

Usage:
  unzip -o seat-ba-fix-pack-v7.zip
  bash apply-fixes-v7.sh
  rm -rf .next
  npm run build

Rollback:
  cp .fix-backup-*/route.ts.bak app/api/cases/[id]/route.ts
