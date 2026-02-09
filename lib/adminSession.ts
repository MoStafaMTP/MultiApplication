import crypto from "crypto";

const COOKIE_NAME = "sc_session";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Role = "ADMIN" | "USER";

type SessionPayload = {
  v: 1;
  iat: number;
  exp: number;
  uid: string;
  role: Role;
  username: string;
};

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

function getSecret() {
  // Set SESSION_SECRET in production. Fallback is dev-only.
  return process.env.SESSION_SECRET || "dev-only-secret-change-me";
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

// Backward-compat: many pages/routes still import these names.
export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function createSessionToken(user: { id: string; role: Role; username: string }, opts?: { ttlMs?: number }) {
  const secret = getSecret();
  const ttl = opts?.ttlMs ?? 7 * ONE_DAY_MS; // 7 days
  const now = Date.now();
  const exp = now + ttl;

  const payloadObj: SessionPayload = {
    v: 1,
    iat: now,
    exp,
    uid: user.id,
    role: user.role,
    username: user.username,
  };

  const payload = base64url(JSON.stringify(payloadObj));
  const sig = hmac(secret, payload);
  return `${payload}.${sig}`;
}

// Backward-compat: admin login route may still call this name.
export function createAdminToken(user: { id: string; role: Role; username: string }) {
  return createSessionToken(user);
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  try {
    if (!token) return null;
    const secret = getSecret();

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, sig] = parts;
    const expected = hmac(secret, payload);

    // timing-safe compare
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    const raw = base64urlToBuffer(payload).toString("utf-8");
    const parsed = JSON.parse(raw) as SessionPayload;

    if (parsed?.v !== 1) return null;
    if (typeof parsed.exp !== "number" || Date.now() >= parsed.exp) return null;
    if (!parsed.uid || !parsed.username || !parsed.role) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string | undefined | null) {
  const s = verifySessionToken(token);
  return !!s && s.role === "ADMIN";
}
