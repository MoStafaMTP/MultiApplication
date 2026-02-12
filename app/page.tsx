import Shell from "../components/Shell";
import { prisma } from "../lib/prisma";
import HomeBrandGallery from "../components/HomeBrandGallery";

// Minimal serializer inline to avoid import mismatch
function toPublicCase(c: any) {
  const media = (c.media ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m: any) => ({
      id: m.id,
      kind: m.kind,
      type: m.type,
      url: m.url,
      posterUrl: m.posterUrl ?? null,
      sortOrder: m.sortOrder ?? 0,
    }));

  return {
    id: c.id,
    title: c.title,
    brand: c.brand,
    model: c.model,
    yearStart: c.yearStart,
    yearEnd: c.yearEnd,
    sku: c.sku ?? null,
    published: c.published,
    media,
  };
}

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Limit to 100 most recent cases to avoid performance issues
  const cases = await prisma.case.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { media: true },
  });

  const publicCases = cases.map(toPublicCase);

  return (
    <Shell>
      <section className="card overflow-hidden p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Seat cover transformations gallery</h1>
          <p className="text-sm subtle-text">Browse cases by brand using the sidebar filter.</p>
        </div>
      </section>

      <HomeBrandGallery initialCases={publicCases} />
    </Shell>
  );
}
