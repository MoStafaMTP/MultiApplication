import crypto from "crypto";

const COOKIE_NAME = "sc_admin";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64urlToBuffer(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}
function hmac(secret: string, payload: string) {
  return base64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function getAdminCookieName() { return COOKIE_NAME; }

export function createAdminToken(opts?: { ttlMs?: number }) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const ttl = opts?.ttlMs ?? ONE_DAY_MS;
  const now = Date.now();
  const exp = now + ttl;

  const payloadObj = { v: 1, iat: now, exp };
  const payload = base64url(JSON.stringify(payloadObj));
  const sig = hmac(secret, payload);
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  try {
    if (!token) return false;
    const secret = process.env.SESSION_SECRET;
    if (!secret) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, sig] = parts;
    const expected = hmac(secret, payload);

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const raw = base64urlToBuffer(payload).toString("utf-8");
    const parsed = JSON.parse(raw) as { exp: number };
    return Date.now() < parsed.exp;
  } catch {
    return false;
  }
}
