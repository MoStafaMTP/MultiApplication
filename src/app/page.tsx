import CaseGallery from "@/components/CaseGallery";
import { prisma } from "@/lib/db";
import { toPublicCase } from "@/lib/serialize";

export default async function Page() {
  const cases = await prisma.case.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Seat Cover Before/After Gallery
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Public gallery for transformations. Search by brand/model/year/SKU. Each case can contain images and/or videos.
        </p>
      </header>

      <section className="mt-8">
        <CaseGallery initialCases={cases.map(toPublicCase)} />
      </section>

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
        Admin management: <a className="underline" href="/admin">/admin</a>
      </footer>
    </main>
  );
}
