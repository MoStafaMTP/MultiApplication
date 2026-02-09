"use client";

import { useMemo, useState } from "react";
import type { PublicCase } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard({ initialCases }: { initialCases: PublicCase[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialCases;
    return initialCases.filter((c) => {
      const hay = `${c.title} ${c.brand} ${c.model} ${c.yearStart} ${c.yearEnd} ${c.sku ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, initialCases]);

  async function onDelete(id: string) {
    if (!confirm("Delete this case?")) return;
    const res = await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Delete failed"); return; }
    router.refresh();
  }

  async function onTogglePublish(id: string, next: boolean) {
    const res = await fetch(`/api/admin/cases/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: next }),
    });
    if (!res.ok) { alert("Update failed"); return; }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-neutral-700">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-neutral-400"
            placeholder="Search title / brand / model / SKU…"
          />
        </div>
        <Link href="/admin/new" className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          + New case
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-700">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Brand/Model</div>
          <div className="col-span-2">Years</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-600">No cases.</div>
        ) : filtered.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50">
            <div className="col-span-4">
              <div className="font-medium">{c.title}</div>
              <div className="mt-1 text-xs text-neutral-500">{c.sku ? `SKU: ${c.sku} • ` : ""}{c.media.length} media</div>
            </div>
            <div className="col-span-2">{c.brand}<div className="text-xs text-neutral-500">{c.model}</div></div>
            <div className="col-span-2">{c.yearStart}–{c.yearEnd}</div>
            <div className="col-span-2">
              <button onClick={() => onTogglePublish(c.id, !c.published)} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs hover:bg-neutral-50">
                {c.published ? "Published" : "Hidden"}
              </button>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <Link href={`/admin/edit/${c.id}`} className="rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-xs hover:bg-neutral-50">Edit</Link>
              <button onClick={() => onDelete(c.id)} className="rounded-2xl border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
