import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";

export function requireAdmin() {
  const token = cookies().get(getAdminCookieName())?.value;
  return verifyAdminToken(token);
}
