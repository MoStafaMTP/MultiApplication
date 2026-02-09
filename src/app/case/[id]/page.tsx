import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CasePrimaryMedia from "@/components/CasePrimaryMedia";
import Link from "next/link";
import { toPublicCase } from "@/lib/serialize";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.case.findUnique({ where: { id }, include: { media: true } });
  if (!c) return notFound();

  const pc = toPublicCase(c);
  const before = pc.media.find((m) => m.kind === "BEFORE");
  const after = pc.media.find((m) => m.kind === "AFTER");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link className="text-sm underline" href="/">← Back</Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">{pc.title}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        {pc.brand} {pc.model} • {pc.yearStart === pc.yearEnd ? pc.yearStart : `${pc.yearStart}–${pc.yearEnd}`}
        {pc.sku ? ` • SKU: ${pc.sku}` : ""}
      </p>

      <div className="mt-6">
        {before && after ? (
          <BeforeAfterSlider
            before={{ type: before.type, url: before.url, posterUrl: before.posterUrl }}
            after={{ type: after.type, url: after.url, posterUrl: after.posterUrl }}
            alt={pc.title}
            aspectRatio={4 / 3}
          />
        ) : (
          <CasePrimaryMedia media={pc.media} alt={pc.title} />
        )}
      </div>
    </main>
  );
}
