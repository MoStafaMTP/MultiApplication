import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { toPublicCase } from "@/lib/serialize";

export default async function AdminPage() {
  const token = cookies().get(getAdminCookieName())?.value;
  if (!verifyAdminToken(token)) redirect("/admin/login");

  const cases = await prisma.case.findMany({ orderBy: { createdAt: "desc" }, include: { media: true } });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-neutral-600">Add / edit / delete cases. Public users can view the gallery.</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50">Logout</button>
        </form>
      </header>

      <AdminDashboard initialCases={cases.map(toPublicCase)} />
    </div>
  );
}
