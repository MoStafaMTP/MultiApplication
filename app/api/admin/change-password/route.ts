import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSessionCookieName, verifySessionToken, verifyAdminToken } from "@/lib/adminSession";

export const runtime = "nodejs";

async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export async function POST(request: Request) {
  const token = await getCookieValue(getSessionCookieName());
  if (!verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sess = verifySessionToken(token);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  const curr = String(currentPassword ?? "");
  const next = String(newPassword ?? "");

  if (!curr || !next) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.adminUser.findUnique({ where: { id: sess.uid } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = verifyPassword(curr, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next) } });
  return NextResponse.json({ ok: true });
}
