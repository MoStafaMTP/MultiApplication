import Shell from "../../../components/Shell";
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CaseMediaColumns from "../../../components/CaseMediaColumns";

function years(y1: number, y2: number) {
  return y1 === y2 ? String(y1) : `${y1}–${y2}`;
}

function sortMedia(media: any[]) {
  return (media ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export const dynamic = 'force-dynamic';

export default async function CasePage({ params }: any) {
  const p = await params;
  const id = (p?.id as string | undefined) ?? undefined;

  if (!id || id === "undefined" || id === "null") return notFound();

  const c = await prisma.case.findUnique({
    where: { id },
    include: { media: true },
  });

  if (!c || !c.published) return notFound();

  const media = sortMedia(c.media);

  const before = media
    .filter((m) => m.kind === "BEFORE")
    .map((m) => ({ id: m.id, url: m.url, type: m.type }));

  const after = media
    .filter((m) => m.kind === "AFTER")
    .map((m) => ({ id: m.id, url: m.url, type: m.type }));

  return (
    <Shell
      rightSlot={
        <Link
          href="/"
          className="rounded-2xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--card), 0.6)" }}
        >
          Back to Home
        </Link>
      }
    >
      <div className="space-y-6">
        <header className="card p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight">{c.title}</h1>
            <p className="text-sm subtle-text">
              {c.brand} {c.model} • {years(c.yearStart, c.yearEnd)}
              {c.sku ? ` • SKU: ${c.sku}` : ""}
            </p>
          </div>
        </header>

        <CaseMediaColumns before={before} after={after} />
      </div>
    </Shell>
  );
}
