import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken, getSessionCookieName } from "@/lib/adminSession";

export const runtime = "nodejs";

const DEFAULT_ADMIN_USERNAME = "Admin";
const DEFAULT_ADMIN_PASSWORD = "123";

// Requested seed user
const SEED_USER_USERNAME = "MoStafaMTP";
const SEED_USER_PASSWORD = "123456";

async function getCookieStore() {
  const maybe = cookies() as any;
  return typeof maybe?.then === "function" ? await maybe : maybe;
}

async function ensureBootstrapUsers() {
  // Admin
  const admin = await prisma.adminUser.findUnique({ where: { username: DEFAULT_ADMIN_USERNAME } });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        username: DEFAULT_ADMIN_USERNAME,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
        role: "ADMIN",
      } as any,
    });
  } else {
    // Ensure role stays ADMIN for the default admin account
    if ((admin as any).role !== "ADMIN") {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { role: "ADMIN" } as any });
    }
  }

  // Seed normal user
  const u = await prisma.adminUser.findUnique({ where: { username: SEED_USER_USERNAME } });
  if (!u) {
    await prisma.adminUser.create({
      data: {
        username: SEED_USER_USERNAME,
        passwordHash: hashPassword(SEED_USER_PASSWORD),
        role: "USER",
      } as any,
    });
  }
}

export async function POST(req: Request) {
  await ensureBootstrapUsers();

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const ok = verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const role = ((user as any).role ?? "USER") as "ADMIN" | "USER";
  const token = createSessionToken({ id: user.id, role, username: user.username });

  const store = await getCookieStore();
  store.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
  });

  return NextResponse.json({ ok: true, role });
}
