Seat-BA Fix Pack v8

Fixes Next.js 15 type-checking error:
  app/case/[id]/page.tsx
  Type 'Props' does not satisfy the constraint 'PageProps' (params should be a Promise)

What it does:
- Changes params type to Promise<{ id: string }>
- Ensures the default export page function is async
- Rewrites params.id -> (await params).id
- Adds an English comment explaining the Next.js 15 behavior
- Creates a backup under .fix-backup-YYYYMMDD-HHMMSS/

Usage:
  cd /var/www/seat-ba
  unzip -o seat-ba-fix-pack-v8.zip
  bash seat-ba-fix-pack-v8/apply-fixes-v8.sh
  rm -rf .next
  npm run build
  pm2 restart seat-ba --update-env
