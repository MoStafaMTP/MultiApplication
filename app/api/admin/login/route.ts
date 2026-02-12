import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken, getSessionCookieName } from "@/lib/adminSession";

export const runtime = "nodejs";

const DEFAULT_USERNAME = "Admin";
const DEFAULT_PASSWORD = "123";

async function getCookieStore() {
  const maybe = cookies() as any;
  return typeof maybe?.then === "function" ? await maybe : maybe;
}

async function ensureDefaultAdmin() {
  const admin = await prisma.adminUser.findUnique({ where: { username: DEFAULT_USERNAME } });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        username: DEFAULT_USERNAME,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        role: "ADMIN",
      } as any,
    });
  } else if ((admin as any).role !== "ADMIN") {
    await prisma.adminUser.update({ where: { id: admin.id }, data: { role: "ADMIN" } as any });
  }
}

export async function POST(request: Request) {
  await ensureDefaultAdmin();

  const { username, password } = await request.json().catch(() => ({}));
  const u = String(username ?? "").trim();
  const p = String(password ?? "");

  if (!u || !p) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.adminUser.findUnique({ where: { username: u } });
  if (!user) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const ok = verifyPassword(p, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  if (((user as any).role ?? "USER") !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const token = createSessionToken({ id: user.id, role: "ADMIN", username: user.username });

  const store = await getCookieStore();
  store.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    // In production behind HTTPS, set COOKIE_SECURE="true" so cookies are Secure-only.
    // On plain HTTP (e.g. bare VPS without TLS), leave it unset or "false" so login works.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
