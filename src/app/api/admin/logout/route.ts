import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminSession";

export const runtime = "nodejs";

export async function POST() {
  cookies().set(getAdminCookieName(), "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
}
