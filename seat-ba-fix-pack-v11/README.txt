Seat-BA Fix Pack v11

Fixes:
- app/api/admin/change-password/route.ts: call rotateAdminPassword with 1 argument (new password), matching src/lib/auth.ts signature.

How to apply on server:
1) Copy seat-ba-fix-pack-v11.zip next to your repo.
2) unzip -o seat-ba-fix-pack-v11.zip
3) bash seat-ba-fix-pack-v11/apply-fixes-v11.sh
4) npm run build
