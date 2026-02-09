# Public + Admin + DB

- Public gallery: `/`
- Case detail: `/case/[id]`
- Admin: `/admin` (password-protected)
- Upload API: `/api/admin/upload` (local filesystem -> public/uploads)
- DB: Prisma + SQLite (DATABASE_URL="file:./dev.db")
