"use client";

import { useMemo, useState } from "react";
import type { PublicCase } from "@/lib/types";
import CaseCard from "@/components/CaseCard";

function normalize(s: string) { return s.trim().toLowerCase(); }

export default function CaseGallery({ initialCases }: { initialCases: PublicCase[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    return initialCases.filter((c) => {
      const hay = normalize([c.title, c.brand, c.model, String(c.yearStart), String(c.yearEnd), c.sku ?? ""].join(" "));
      return q.length === 0 || hay.includes(q);
    });
  }, [query, initialCases]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-neutral-700">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ford Expedition 2018 SKU…"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-400"
          />
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        Showing <span className="font-medium text-neutral-900">{filtered.length}</span>{" "}
        case{filtered.length === 1 ? "" : "s"}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filtered.map((c) => <CaseCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}
