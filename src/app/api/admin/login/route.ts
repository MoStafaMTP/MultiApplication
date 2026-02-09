import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminToken, getAdminCookieName } from "../../../../lib/adminSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return NextResponse.json({ error: "ADMIN_PASSWORD is not set" }, { status: 500 });
  if (!password || String(password) !== String(adminPassword)) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  const token = createAdminToken();
  (await cookies()).set(getAdminCookieName(), token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });

  return NextResponse.json({ ok: true });
}
