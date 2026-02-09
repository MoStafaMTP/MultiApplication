import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSessionCookieName, verifyAdminToken, verifySessionToken } from "@/lib/adminSession";

export const runtime = "nodejs";

async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export async function GET() {
  const token = await getCookieValue(getSessionCookieName());
  if (!verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, role: true, createdAt: true, updatedAt: true } as any,
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const token = await getCookieValue(getSessionCookieName());
  if (!verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  const role = String(body?.role ?? "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  if (!username || !password) return NextResponse.json({ error: "username/password required" }, { status: 400 });

  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "Username already exists" }, { status: 409 });

  const created = await prisma.adminUser.create({
    data: {
      username,
      passwordHash: hashPassword(password),
      role,
    } as any,
    select: { id: true, username: true, role: true, createdAt: true } as any,
  });

  return NextResponse.json({ ok: true, user: created });
}
