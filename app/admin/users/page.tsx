import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifyAdminToken } from "@/lib/adminSession";
import AdminUsers from "@/components/admin/AdminUsers";

async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export default async function AdminUsersPage() {
  const token = await getCookieValue(getSessionCookieName());
  if (!verifyAdminToken(token)) redirect("/login");

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="text-xl font-black">Users</div>
        <div className="mt-1 text-sm subtle-text">Add users and change passwords.</div>
      </div>

      <AdminUsers />
    </div>
  );
}
