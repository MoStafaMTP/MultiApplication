import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSessionCookieName, verifyAdminToken } from "@/lib/adminSession";

export const runtime = "nodejs";

async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export async function POST(req: Request, { params }: any) {
  const p = await params;
  const id = p?.id as string | undefined;

  const token = await getCookieValue(getSessionCookieName());
  if (!verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const newPassword = String(body?.newPassword ?? "");
  if (!newPassword) return NextResponse.json({ error: "newPassword required" }, { status: 400 });

  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash: hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
