# Seat Cover Before/After Web App (Next.js MVP)

This is a minimal, production-leaning **before/after gallery** you can use to showcase seat cover transformations.

## 1) Create the Next.js project
Use the official CLI:

```bash
npx create-next-app@latest seat-cover-before-after
```

Recommended prompts:
- TypeScript: Yes
- App Router: Yes
- Tailwind: Yes
- ESLint: Yes
- src/ directory: Yes

Then `cd seat-cover-before-after`.

## 2) Install the compare slider component

```bash
npm i react-comparison-slider
```

## 3) Copy these files into your project

Copy the contents of this ZIP into your Next.js project root (it includes:
`src/app/*`, `src/components/*`, `src/data/*`).

If you already have files with the same names, overwrite them.

## 4) Add your images
Option A (simple): put images under `public/cases/` and update `src/data/demoCases.ts`

Example paths:
- `/cases/expedition-before.jpg`
- `/cases/expedition-after.jpg`

Option B (recommended later): use Cloudinary/S3 and store remote URLs.

## 5) Run
```bash
npm run dev
```

Open http://localhost:3000

## Optional: Admin uploads (next step)
If you want a simple admin page for uploading “Before/After” pairs and saving to a database + CDN,
tell me which hosting you prefer (Vercel + Postgres, or your own VPS) and whether you want:
- Cloudinary upload widget
- S3/R2 direct uploads
- Login (Clerk / NextAuth)
