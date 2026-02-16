# Seat-BA Fix Pack v5 (فارسی)

این پچ فقط یک مشکل TypeScript در Next.js 15 را حل می‌کند:

**Route Handler** در فایل زیر نباید برای آرگومان دوم `type alias` (مثل `Ctx`) استفاده کند؛
باید تایپ آرگومان دوم به صورت **inline** نوشته شود، و `params` هم به شکل `Promise` هندل شود.

فایل هدف:
- `app/api/admin/cases/[id]/route.ts`

## اجرا روی سرور
```bash
cd /var/www/seat-ba

unzip -o seat-ba-fix-pack-v5.zip
bash apply-fixes-v5.sh

rm -rf .next
npm run build
```

اگر build موفق شد:
```bash
pm2 restart seat-ba --update-env
pm2 logs seat-ba --lines 80
```

## نکته
این پچ هیچ فولدر اضافی داخل پروژه اضافه نمی‌کند. فقط همان فایل را overwrite می‌کند و یک بکاپ می‌سازد.
