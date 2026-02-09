"use client";

import { useMemo, useState } from "react";
import type { PublicCase } from "../lib/types";
import CaseCard from "./CaseCard";

function normalize(s: string) {
  return (s ?? "").trim().toLowerCase();
}

export default function CaseGallery({ initialCases }: { initialCases: PublicCase[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return initialCases;

    return initialCases.filter((c) => {
      const hay = [
        c.title,
        (c as any).brand,
        (c as any).model,
        (c as any).sku ?? "",
        String((c as any).yearStart ?? ""),
        String((c as any).yearEnd ?? ""),
      ]
        .map((x) => normalize(String(x ?? "")))
        .join(" ");

      return hay.includes(q);
    });
  }, [query, initialCases]);

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full flex-col gap-2">
            <label className="text-sm font-semibold">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ford Expedition 2018 SKU…"
              className="home-search-input soft-ring w-full rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }}
            />
          </div>

          <div className="mt-1 text-sm subtle-text sm:mt-0 sm:pb-1">
            <span className="font-semibold" style={{ color: "rgb(var(--fg))" }}>
              {filtered.length}
            </span>{" "}
            case{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filtered.map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
