import type { PublicCase } from "@/lib/types";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CasePrimaryMedia from "@/components/CasePrimaryMedia";
import Link from "next/link";

function years(y1: number, y2: number) { return y1 === y2 ? String(y1) : `${y1}–${y2}`; }

export default function CaseCard({ c }: { c: PublicCase }) {
  const before = c.media.find((m) => m.kind === "BEFORE");
  const after = c.media.find((m) => m.kind === "AFTER");

  return (
    <div className="group rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-3">
        {before && after ? (
          <BeforeAfterSlider
            before={{ type: before.type, url: before.url, posterUrl: before.posterUrl }}
            after={{ type: after.type, url: after.url, posterUrl: after.posterUrl }}
            alt={c.title}
          />
        ) : (
          <CasePrimaryMedia media={c.media} alt={c.title} />
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-snug">{c.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {c.brand} {c.model} • {years(c.yearStart, c.yearEnd)}
            </p>
          </div>
          {c.sku ? (
            <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700">
              {c.sku}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/case/${c.id}`}
            className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-600"
          >
            Open case
          </Link>
          <span className="text-xs text-neutral-500">{c.media.length} media</span>
        </div>
      </div>
    </div>
  );
}
