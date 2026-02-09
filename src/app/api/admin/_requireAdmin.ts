import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";

export async function requireAdmin() {
  const token = (await cookies()).get(getAdminCookieName())?.value;
  return verifyAdminToken(token);
}
