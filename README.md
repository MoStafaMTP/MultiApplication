# Seat Cover Before/After (Final)

این پروژه یک نمونه‌ی کامل Next.js (App Router) است که شامل:
- پنل ادمین برای ساخت/ویرایش Case
- انتخاب **عکس و ویدیو از Media Library** داخل صفحه Add Case
- آپلود فایل‌ها به مسیر `public/media/uploads`
- API های ادمین (login / change-password / cases / media)
- نمایش عمومی Case در مسیر `/case/[id]`

## راه‌اندازی

```bash
npm install
npm run dev
```

سپس:
- لاگین ادمین: `http://localhost:3000/admin/login`
- لیست کیس‌ها: `http://localhost:3000/admin/cases`
- مدیا گالری: `http://localhost:3000/admin/media`

## نکته مهم درباره مشکل فایل‌های تکراری

شما در پروژه‌تان همزمان این دو مسیر را داشتید:
- `app/api/...`
- `src/app/api/...`

این باعث می‌شود Route ها دوبار تعریف شوند. در این نسخه نهایی **فقط** `app/api/...` وجود دارد. اگر روی پروژه قبلی merge می‌کنید، یکی از این دو را کامل حذف کنید (پیشنهاد: `src/app` را حذف کنید).

## Media Library در Add Case

در صفحه New Case / Edit Case برای هر بخش (Before / After / Videos):
- Upload file
- Paste URL
- **Pick from Media Library**  ✅

Media Library فایل‌های داخل این مسیرها را لیست می‌کند:
- `public/media/`
- `public/media/uploads/`

