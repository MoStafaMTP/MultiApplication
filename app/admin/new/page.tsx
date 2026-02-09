import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "../../../lib/adminSession";
import AdminCaseForm from "../../../components/admin/AdminCaseForm";

// NOTE: Next 15+: cookies() can be async. This helper supports both.
async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export default async function NewCasePage() {
  const token = await getCookieValue(getAdminCookieName());
  if (!verifyAdminToken(token)) redirect("/admin/login");

  return <AdminCaseForm mode="create" />;
}
