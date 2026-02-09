import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "../../../lib/adminSession";

export async function requireAdmin() {
  // Next 15+: cookies() may return a Promise
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;

  const token = store?.get?.(getAdminCookieName())?.value;
  return verifyAdminToken(token);
}
