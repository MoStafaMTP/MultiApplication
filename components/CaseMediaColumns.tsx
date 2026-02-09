"use client";

import { useMemo, useState } from "react";

type Item = { id: string; url: string; type: "IMAGE" | "VIDEO" };

function MediaTile({ m }: { m: Item }) {
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-2xl border p-2 transition hover:opacity-95"
      style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.25)" }}
      title="Open in new tab"
    >
      <div className="aspect-square overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--card-border))" }}>
        {m.type === "VIDEO" ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
                aria-hidden="true"
              >
                <span className="text-lg">▶</span>
              </div>
              <div className="text-xs subtle-text">Video</div>
            </div>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.url} alt="media" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {/* removed IMAGE/VIDEO label */}
        <span className="text-xs subtle-text"></span>
        <span className="text-xs font-semibold opacity-0 transition group-hover:opacity-100">Open</span>
      </div>
    </a>
  );
}

function Column({
  title,
  subtitle,
  items,
  initial = 24,
  step = 24,
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
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs subtle-text">{subtitle}</div>
        </div>
        <span className="text-xs subtle-text">
          {shown.length}/{items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 text-sm subtle-text">No media.</div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">{shown.map((m) => <MediaTile key={m.id} m={m} />)}</div>

          {hasMore ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setLimit((v) => Math.min(items.length, v + step))}
                className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function CaseMediaColumns({ before, after }: { before: Item[]; after: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left AFTER, Right BEFORE */}
      <Column title="AFTER" subtitle="After photos/videos." items={after} />
      <Column title="BEFORE" subtitle="Before photos/videos." items={before} />
    </div>
  );
}
