import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import AdminCaseForm from "@/components/admin/AdminCaseForm";

export default function NewCasePage() {
  const token = cookies().get(getAdminCookieName())?.value;
  if (!verifyAdminToken(token)) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New case</h1>
        <p className="mt-2 text-sm text-neutral-600">Create a new before/after case. Upload images/videos or paste URLs.</p>
      </div>
      <AdminCaseForm mode="create" />
    </div>
  );
}
