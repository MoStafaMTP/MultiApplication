"use client";

import { useMemo, useState } from "react";
import type { PublicCase, PublicMedia } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "create" | "edit";
type UploadResult = { url: string; type: "IMAGE" | "VIDEO" };

async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
  return res.json();
}

function pickMedia(media: PublicMedia[], kind: "BEFORE" | "AFTER") {
  return media.find((m) => m.kind === kind) ?? null;
}

export default function AdminCaseForm({ mode, initialCase }: { mode: Mode; initialCase?: PublicCase }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialCase?.title ?? "");
  const [brand, setBrand] = useState(initialCase?.brand ?? "");
  const [model, setModel] = useState(initialCase?.model ?? "");
  const [yearStart, setYearStart] = useState(String(initialCase?.yearStart ?? ""));
  const [yearEnd, setYearEnd] = useState(String(initialCase?.yearEnd ?? ""));
  const [sku, setSku] = useState(initialCase?.sku ?? "");
  const [published, setPublished] = useState(initialCase?.published ?? true);

  const beforeExisting = useMemo(() => (initialCase ? pickMedia(initialCase.media, "BEFORE") : null), [initialCase]);
  const afterExisting = useMemo(() => (initialCase ? pickMedia(initialCase.media, "AFTER") : null), [initialCase]);

  const [beforeUrl, setBeforeUrl] = useState(beforeExisting?.url ?? "");
  const [afterUrl, setAfterUrl] = useState(afterExisting?.url ?? "");
  const [beforeType, setBeforeType] = useState<"IMAGE" | "VIDEO">(beforeExisting?.type ?? "IMAGE");
  const [afterType, setAfterType] = useState<"IMAGE" | "VIDEO">(afterExisting?.type ?? "IMAGE");

  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryType, setGalleryType] = useState<"IMAGE" | "VIDEO">("VIDEO");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(kind: "before" | "after" | "gallery", file: File) {
    setBusy(true);
    setError(null);
    try {
      const r = await uploadFile(file);
      if (kind === "before") { setBeforeUrl(r.url); setBeforeType(r.type); }
      if (kind === "after") { setAfterUrl(r.url); setAfterType(r.type); }
      if (kind === "gallery") { setGalleryUrl(r.url); setGalleryType(r.type); }
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const ys = Number(yearStart);
    const ye = Number(yearEnd);

    if (!title || !brand || !model) { setBusy(false); setError("Title, brand, and model are required."); return; }
    if (!Number.isFinite(ys) || !Number.isFinite(ye)) { setBusy(false); setError("Year start and year end must be numbers."); return; }

    const media: Array<{ kind: "BEFORE" | "AFTER" | "GALLERY"; type: "IMAGE" | "VIDEO"; url: string; sortOrder?: number }> = [];
    if (beforeUrl) media.push({ kind: "BEFORE", type: beforeType, url: beforeUrl, sortOrder: 0 });
    if (afterUrl) media.push({ kind: "AFTER", type: afterType, url: afterUrl, sortOrder: 0 });
    if (galleryUrl) media.push({ kind: "GALLERY", type: galleryType, url: galleryUrl, sortOrder: 0 });

    const payload = { title, brand, model, yearStart: ys, yearEnd: ye, sku: sku || null, published, media };

    try {
      const url = mode === "create" ? "/api/admin/cases" : `/api/admin/cases/${initialCase!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Save failed");
      }
      router.push("/admin");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-neutral-700">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" required />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="w-full">
            <label className="text-sm font-medium text-neutral-700">Published</label>
            <div className="mt-1 flex items-center gap-2">
              <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              <label htmlFor="published" className="text-sm text-neutral-700">Visible in public gallery</label>
            </div>
          </div>
          <Link href="/admin" className="text-sm underline">Cancel</Link>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700">Brand *</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" required />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Model *</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" required />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700">Year Start *</label>
          <input value={yearStart} onChange={(e) => setYearStart(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" required />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Year End *</label>
          <input value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" required />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-neutral-700">SKU (optional)</label>
          <input value={sku ?? ""} onChange={(e) => setSku(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold">Before</div>
          <div className="mt-3 space-y-2">
            <input type="file" accept="image/*,video/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload("before", f); }} />
            <div className="text-xs text-neutral-500">or paste URL</div>
            <input value={beforeUrl} onChange={(e) => setBeforeUrl(e.target.value)} placeholder="/uploads/..." className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400" />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold">After</div>
          <div className="mt-3 space-y-2">
            <input type="file" accept="image/*,video/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload("after", f); }} />
            <div className="text-xs text-neutral-500">or paste URL</div>
            <input value={afterUrl} onChange={(e) => setAfterUrl(e.target.value)} placeholder="/uploads/..." className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400" />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold">Extra (optional)</div>
          <div className="mt-3 space-y-2">
            <input type="file" accept="image/*,video/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload("gallery", f); }} />
            <div className="text-xs text-neutral-500">or paste URL</div>
            <input value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} placeholder="/uploads/..." className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400" />
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <button disabled={busy} className="rounded-2xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
        {busy ? "Saving…" : mode === "create" ? "Create case" : "Save changes"}
      </button>

      <div className="text-xs text-neutral-500">Local uploads save into <code>public/uploads</code> and URL is stored in DB.</div>
    </form>
  );
}
