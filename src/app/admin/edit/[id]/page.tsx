import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import { prisma } from "@/lib/db";
import { toPublicCase } from "@/lib/serialize";
import AdminCaseForm from "@/components/admin/AdminCaseForm";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(getAdminCookieName())?.value;
  if (!verifyAdminToken(token)) redirect("/admin/login");

  const c = await prisma.case.findUnique({ where: { id }, include: { media: true } });
  if (!c) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit case</h1>
        <p className="mt-2 text-sm text-neutral-600">Update fields and replace media.</p>
      </div>
      <AdminCaseForm mode="edit" initial={toPublicCase(c)} />
    </div>
  );
}
