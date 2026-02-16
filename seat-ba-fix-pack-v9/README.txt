Seat-BA Fix Pack v9

What this fixes
- Next.js build failing due to TypeScript error:
  "Parameter 'c' implicitly has an 'any' type"
  at app/admin/(protected)/cases/page.tsx

What it changes
- Adds a minimal local type (CaseListItem) to the page file.
- Annotates cases.map callback parameter as CaseListItem so noImplicitAny passes.

How to apply (run from your project root)
1) unzip seat-ba-fix-pack-v9.zip next to your repo OR copy the folder into the repo
2) run:
   bash seat-ba-fix-pack-v9/apply-fixes-v9.sh
3) rebuild:
   npm run build

Rollback
- Your original file is backed up under:
  .fix-backup-YYYYMMDD-HHMMSS/page.tsx.bak
