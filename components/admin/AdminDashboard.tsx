"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublicCase } from "../../lib/types";

function years(y1: number, y2: number) {
  return y1 === y2 ? String(y1) : `${y1}–${y2}`;
}

export default function AdminDashboard({ initialCases }: { initialCases: PublicCase[] }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<PublicCase[]>(initialCases ?? []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c: any) => {
      return (
        String(c.title ?? "").toLowerCase().includes(s) ||
        String(c.brand ?? "").toLowerCase().includes(s) ||
        String(c.model ?? "").toLowerCase().includes(s) ||
        String(c.sku ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">Cases</h2>
          <p className="mt-1 text-sm subtle-text">Search, edit, or delete cases.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="soft-ring w-56 rounded-2xl border px-3 py-2 text-sm"
            style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }}
          />
          <Link
            href="/admin/new"
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 dark:bg-sky-500 dark:text-slate-900"
          >
            New case
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border" style={{ borderColor: "rgb(var(--card-border))" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ background: "rgba(var(--surface-2), 0.45)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Years</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any) => {
              const id = c?.id ?? c?.caseId;
              const canEdit = typeof id === "string" && id.length > 0 && id !== "undefined";
              return (
                <tr key={id ?? c.title} className="border-t" style={{ borderColor: "rgb(var(--card-border))" }}>
                  <td className="px-4 py-3 font-semibold">{c.title}</td>
                  <td className="px-4 py-3 subtle-text">
                    {c.brand} {c.model} {c.sku ? <span className="ml-2 text-xs">({c.sku})</span> : null}
                  </td>
                  <td className="px-4 py-3 subtle-text">{years(c.yearStart, c.yearEnd)}</td>
                  <td className="px-4 py-3">
                    {c.published ? (
                      <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.55)" }}>
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.25)" }}>
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {canEdit ? (
                        <Link className="text-sm font-semibold underline underline-offset-4" href={`/admin/edit/${id}`}>
                          Edit
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold subtle-text">Edit</span>
                      )}
                      {/* Delete button (optional) – keep your existing if you have one */}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm subtle-text">
                  No cases found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
