Seat-BA Fix Pack v4

این پچ فقط یک مشکل TypeScript در Next.js Route Handler را حل می‌کند:

خطا:
Route ... has an invalid "GET" export: Type "Ctx" is not a valid type for the function's second argument

راه‌حل:
در فایل app/api/admin/cases/[id]/route.ts نوع آرگومان دوم GET/PATCH/DELETE باید به صورت inline type literal نوشته شود.

نصب:
1) فایل zip را روی سرور کنار پروژه کپی کن.
2) داخل روت پروژه:
   unzip -o seat-ba-fix-pack-v4.zip
   bash seat-ba-fix-pack-v4/apply-fixes-v4.sh
   npm run build

در صورت نیاز می‌توانی از بکاپ داخل .fix-backup-* برگردانی.
