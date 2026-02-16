import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminSession";
import MediaLibrary from "@/components/admin/MediaLibrary";
import Link from "next/link";

async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export default async function MediaPage() {
  const token = await getCookieValue(getAdminCookieName());
  if (!verifyAdminToken(token)) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <header className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Media Library</h1>
            <p className="mt-2 text-sm subtle-text">Upload, view, and manage your media files.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <MediaLibrary />
    </div>
  );
}

