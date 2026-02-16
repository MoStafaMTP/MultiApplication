"use client";

import { useMemo, useState } from "react";

type Item = { id: string; url: string; type: "IMAGE" | "VIDEO" };

function MediaTile({ m }: { m: Item }) {
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.25)" }}
      title="Open"
    >
      {m.type === "VIDEO" ? (
        <div className="flex aspect-square items-center justify-center text-sm font-semibold opacity-80">
          <span className="mr-2">▶</span> Video
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.url}
          alt="media"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      )}
    </a>
  );
}

function Column({
  title,
  subtitle,
  items,
  initial = 18,
  step = 18,
}: {
  title: string;
  subtitle: string;
  items: Item[];
  initial?: number;
  step?: number;
}) {
  const [limit, setLimit] = useState(initial);
  const shown = useMemo(() => items.slice(0, limit), [items, limit]);
  const hasMore = items.length > shown.length;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="text-xs opacity-70">{subtitle}</div>
        </div>
        <div className="text-xs font-semibold opacity-70">
          {shown.length}/{items.length}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm opacity-70" style={{ borderColor: "rgb(var(--card-border))" }}>
          No media.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {shown.map((m) => (
              <MediaTile key={m.id} m={m} />
            ))}
          </div>

          {hasMore ? (
            <button
              type="button"
              onClick={() => setLimit((v) => Math.min(items.length, v + step))}
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
            >
              Load more
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function CaseMediaColumns({ before, after }: { before: Item[]; after: Item[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left AFTER, Right BEFORE */}
      <div className="rounded-3xl border p-5" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.2)" }}>
        <Column title="After" subtitle="Final / installed results" items={after} />
      </div>
      <div className="rounded-3xl border p-5" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.2)" }}>
        <Column title="Before" subtitle="Original condition" items={before} />
      </div>
    </div>
  );
}
