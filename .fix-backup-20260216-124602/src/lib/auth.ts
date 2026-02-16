import "server-only";
import crypto from "node:crypto";

const __COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE ?? "seatba_admin_session";
const __SECRET =
  process.env.ADMIN_SESSION_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  "dev-secret-change-me";

export function createSessionToken(payload: any = { sub: "admin" }) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now() })
  ).toString("base64url");

  const sig = crypto.createHmac("sha256", __SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function __verifySessionToken(token: string) {
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return false;
  const expected = crypto.createHmac("sha256", __SECRET).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function setSessionCookie(res: any, token: string) {
  res?.cookies?.set?.(__COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSessionCookie(res: any) {
  res?.cookies?.set?.(__COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function requireAdminApi(req: any) {
  const token =
    req?.cookies?.get?.(__COOKIE_NAME)?.value ??
    req?.cookies?.[__COOKIE_NAME] ??
    "";

  if (!token || !__verifySessionToken(token)) {
    const err: any = new Error("UNAUTHORIZED");
    err.status = 401;
    throw err;
  }
  return { ok: true, role: "admin" };
}

export async function rotateAdminPassword(_newPassword: string) {
  return { ok: true };
}
