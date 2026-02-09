import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "sc_session";

function hasFileExtension(pathname: string) {
  // e.g. /logo.png, /robots.txt
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function b64urlToBytes(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256B64url(secret: string, payload: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bytesToB64url(new Uint8Array(sig));
}

async function verifyToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  const secret = process.env.SESSION_SECRET || "dev-only-secret-change-me";
  const expected = await hmacSha256B64url(secret, payload);
  if (sig !== expected) return null;

  try {
    const raw = new TextDecoder().decode(b64urlToBytes(payload));
    const data = JSON.parse(raw) as { exp: number; role?: string; uid?: string };
    if (typeof data?.exp !== "number" || Date.now() >= data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next internals, API, and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico" || hasFileExtension(pathname)) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === "/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const sess = await verifyToken(token);

  if (!sess) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin section requires ADMIN role
  if (pathname.startsWith("/admin")) {
    if (sess.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)"],
};
