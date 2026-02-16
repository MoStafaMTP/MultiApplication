Seat-BA Fix Pack v10
-------------------
Fixes Next.js/TypeScript build error in:
  app/admin/(protected)/cases/page.tsx

Error:
  Property 'model' does not exist on type 'CaseListItem'.

What this does:
- Expands the local CaseListItem type to include `model` and `updatedAt` (and a few other commonly-used fields).

How to apply:
  cd /var/www/seat-ba
  unzip -o seat-ba-fix-pack-v10.zip
  bash seat-ba-fix-pack-v10/apply-fixes-v10.sh
  npm run build
