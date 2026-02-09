import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getAdminCookieName, verifyAdminToken } from "../../lib/adminSession";
import AdminDashboard from "../../components/admin/AdminDashboard";
import Link from "next/link";

// NOTE: Next 15+ cookies() can be async. We support both.
async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export default async function AdminPage() {
  const token = await getCookieValue(getAdminCookieName());
  if (!verifyAdminToken(token)) redirect("/admin/login");

  const cases = await prisma.case.findMany({ orderBy: { createdAt: "desc" }, include: { media: true } });

  return (
    <div className="space-y-6">
      <header className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
            <p className="mt-2 text-sm subtle-text">Create / edit / delete cases. Public users can view the gallery.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
            >
              Manage Users
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.7)" }}
            >
              Settings
            </Link>
            <form action="/api/admin/logout" method="post">
              <button
                className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.7)" }}
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminDashboard initialCases={cases as any} />
    </div>
  );
}
