"use client";

import { useMemo, useState } from "react";
import type { PublicCase } from "../lib/types";
import { BRANDS } from "../lib/brands";
import CaseGallery from "./CaseGallery";

function norm(s: string) {
  return (s ?? "").trim().toLowerCase();
}

export default function HomeBrandGallery({ initialCases }: { initialCases: PublicCase[] }) {
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const filtered = useMemo(() => {
    if (!selectedBrand) return initialCases;
    const b = norm(selectedBrand);
    return initialCases.filter((c) => norm((c as any).brand) === b);
  }, [initialCases, selectedBrand]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of initialCases) {
      const b = String((c as any).brand ?? "").trim();
      if (!b) continue;
      map.set(b, (map.get(b) ?? 0) + 1);
    }
    return map;
  }, [initialCases]);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="card h-fit p-4 lg:sticky lg:top-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Brands</div>
          <button
            type="button"
            onClick={() => setSelectedBrand("")}
            className="text-xs font-semibold underline underline-offset-4 subtle-text"
            disabled={!selectedBrand}
            aria-disabled={!selectedBrand}
          >
            Reset
          </button>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setSelectedBrand("")}
            className={
              "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm transition hover:opacity-90 " +
              (selectedBrand ? "" : "font-semibold")
            }
            style={{
              borderColor: "rgb(var(--card-border))",
              background: selectedBrand ? "rgba(var(--surface-2), 0.15)" : "rgba(var(--surface-2), 0.45)",
            }}
          >
            <span>All brands</span>
            <span className="text-xs subtle-text">{initialCases.length}</span>
          </button>
        </div>

        <div className="pretty-scroll mt-3 max-h-[60vh] space-y-2 overflow-auto pr-1">
          {BRANDS.map((b) => {
            const active = norm(selectedBrand) === norm(b);
            const count = counts.get(b) ?? 0;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBrand(b)}
                className={
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm transition hover:opacity-90 " +
                  (active ? "font-semibold" : "")
                }
                style={{
                  borderColor: "rgb(var(--card-border))",
                  background: active ? "rgba(var(--surface-2), 0.45)" : "rgba(var(--surface-2), 0.15)",
                }}
              >
                <span>{b}</span>
                <span className="text-xs subtle-text">{count}</span>
              </button>
            );
          })}
        </div>

        {selectedBrand ? (
          <div
            className="mt-4 rounded-2xl border p-3 text-xs subtle-text"
            style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.15)" }}
          >
            Filtering by: <span className="font-semibold">{selectedBrand}</span>
          </div>
        ) : null}
      </aside>

      <section>
        {/* Key forces CaseGallery internal state to reset when brand changes */}
        <CaseGallery key={selectedBrand || "all"} initialCases={filtered} />
      </section>
    </div>
  );
}
