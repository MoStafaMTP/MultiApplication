import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "../../../../lib/adminSession";
import { prisma } from "../../../../lib/prisma";
import AdminCaseForm from "../../../../components/admin/AdminCaseForm";

// Next 15+: cookies() can be async. This helper supports both.
async function getCookieValue(name: string) {
  const maybe = cookies() as any;
  const store = typeof maybe?.then === "function" ? await maybe : maybe;
  return store?.get?.(name)?.value as string | undefined;
}

export default async function EditCasePage({ params }: any) {
  const token = await getCookieValue(getAdminCookieName());
  if (!verifyAdminToken(token)) redirect("/admin/login");

  // Next 15+: params can be awaited safely.
  const p = await params;
  const id = p?.id as string | undefined;

  if (!id || id === "undefined" || id === "null") return notFound();

  const c = await prisma.case.findUnique({ where: { id }, include: { media: true } });
  if (!c) return notFound();

  // Map DB -> PublicCase shape
  const initialCase: any = {
    id: c.id,
    title: c.title,
    brand: c.brand,
    model: c.model,
    yearStart: c.yearStart,
    yearEnd: c.yearEnd,
    sku: c.sku ?? null,
    published: c.published,
    media: (c.media ?? [])
      .slice()
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((m: any) => ({
        id: m.id,
        kind: m.kind,
        type: m.type,
        url: m.url,
        posterUrl: m.posterUrl ?? null,
        sortOrder: m.sortOrder ?? 0,
      })),
  };

  return <AdminCaseForm mode="edit" initial={initialCase} />;
}
