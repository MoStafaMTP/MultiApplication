# Patch: Login-required + multi-user management + seed user + copyright

## What you get
- **Login required**: anyone who is not logged in is redirected to `/login` (home + case pages + admin pages).
- **Multi-user** auth in DB (Admin/User roles).
- **Admin can add users** and **change user passwords** at `/admin/users`.
- Seeds a user in DB: **MoStafaMTP / 123456**
- Updates footer copyright to: **© 2026 United Seat Factory • All Rights Reserved**
- Adds optional logo URL env: `NEXT_PUBLIC_BRAND_LOGO_URL`

---

## 1) Copy files
Extract this zip and copy/merge its folders into your project root (overwrite when asked).

---

## 2) Update Prisma schema (REQUIRED)
Edit your `prisma/schema.prisma` and update the `AdminUser` model.

### Add this enum (near the top, before models):
```prisma
enum UserRole {
  ADMIN
  USER
}
```

### Update `AdminUser` model to include `role`:
```prisma
model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  role         UserRole @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## 3) Apply DB changes + regenerate client
From project root:

```powershell
npx prisma db push
npx prisma generate
```

(If you use migrations instead of db push, you can do `npx prisma migrate dev`.)

---

## 4) Add SESSION_SECRET (IMPORTANT)
Create/update `.env.local`:

```env
SESSION_SECRET="a-long-random-secret-change-me"
```

Optional logo in header:

```env
NEXT_PUBLIC_BRAND_LOGO_URL="https://your-domain.com/logo.png"
```

---

## 5) Run
```powershell
npm run dev
```

---

## Login
- Default admin: **Admin / 123**
- Seeded user: **MoStafaMTP / 123456**

Admin user management:
- Open: `/admin/users`
