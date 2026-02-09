"use client";

import Link from "next/link";
import type { PublicCase, PublicMedia } from "../lib/types";

function years(y1: number, y2: number) {
  return y1 === y2 ? String(y1) : `${y1}–${y2}`;
}

function firstOfKind(media: PublicMedia[], kind: "BEFORE" | "AFTER") {
  return (media ?? [])
    .filter((m) => m.kind === kind)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
}

function Thumb({ m, label }: { m?: PublicMedia; label: "BEFORE" | "AFTER" }) {
  return (
    <div
      className="rounded-3xl border p-2"
      style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.25)" }}
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <span className="text-[11px] font-semibold tracking-wide subtle-text">{label}</span>
        {/* removed IMAGE/VIDEO label */}
      </div>

      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border"
        style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface), 0.25)" }}
      >
        {!m ? (
          <div className="flex h-full w-full items-center justify-center text-xs subtle-text">No media</div>
        ) : m.type === "VIDEO" ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border"
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
          <img
            src={m.url}
            alt={`${label} thumbnail`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}

export default function CaseCard({ c }: { c: PublicCase }) {
  const before = firstOfKind(c.media, "BEFORE");
  const after = firstOfKind(c.media, "AFTER");

  return (
    <Link
      href={`/case/${c.id}`}
      className="card block overflow-hidden transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
      aria-label={`Open case: ${c.title}`}
    >
      <div className="p-3">
        {/* LEFT = AFTER, RIGHT = BEFORE */}
        <div className="grid grid-cols-2 gap-3">
          <Thumb m={after} label="AFTER" />
          <Thumb m={before} label="BEFORE" />
        </div>
      </div>

      <div className="border-t p-4" style={{ borderColor: "rgb(var(--card-border))" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{c.title}</div>
            <div className="mt-1 text-xs subtle-text">
              {c.brand} {c.model} • {years(c.yearStart, c.yearEnd)}
            </div>
          </div>

          {c.sku ? (
            <span
              className="shrink-0 rounded-xl border px-2 py-1 text-xs"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.7)" }}
            >
              {c.sku}
            </span>
          ) : null}
        </div>

        {/* removed "Click anywhere to open" */}
        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs subtle-text">{c.media.length} media</span>
        </div>
      </div>
    </Link>
  );
}
