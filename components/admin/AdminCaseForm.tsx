"use client";

import { useMemo, useState } from "react";
import type { PublicCase, PublicMedia } from "../../lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRANDS } from "../../lib/brands";

type Mode = "create" | "edit";
type UploadResult = { url: string; type: "IMAGE" | "VIDEO" };

async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
  return res.json();
}

type UiMedia = { url: string; type: "IMAGE" | "VIDEO"; sortOrder: number };

function mediaFromKind(media: PublicMedia[], kind: "BEFORE" | "AFTER") {
  return media
    .filter((m) => m.kind === kind)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m, i) => ({ url: m.url, type: m.type as "IMAGE" | "VIDEO", sortOrder: i }));
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function inBrandList(value: string) {
  return BRANDS.some((b) => b.toLowerCase() === (value ?? "").toLowerCase());
}

function Section({
  title,
  subtitle,
  items,
  busy,
  inputStyle,
  onFiles,
  urlValue,
  onUrlChange,
  urlType,
  onUrlTypeChange,
  onAddUrl,
  onRemove,
  onOpenLibrary,
}: {
  title: string;
  subtitle: string;
  items: UiMedia[];
  busy: boolean;
  inputStyle: any;
  onFiles: (files: FileList | null) => void;
  urlValue: string;
  onUrlChange: (v: string) => void;
  urlType: "IMAGE" | "VIDEO";
  onUrlTypeChange: (t: "IMAGE" | "VIDEO") => void;
  onAddUrl: () => void;
  onRemove: (index: number) => void;
   onOpenLibrary: () => void;
}) {
  return (
    <div className="rounded-3xl border p-5" style={inputStyle}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs subtle-text">{subtitle}</div>
        </div>
        <div className="text-xs subtle-text">{busy ? "Uploading…" : "You can multi-select files"}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border p-4" style={inputStyle}>
          <div className="text-sm font-semibold">Upload files</div>
          <div className="mt-3 space-y-2">
            <label
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
            >
              <input
                className="hidden"
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={busy}
                onChange={(e) => onFiles(e.target.files)}
              />
              Choose files
            </label>
            <div className="text-xs subtle-text">You can select multiple files at once.</div>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-xs font-semibold transition hover:opacity-90"
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.2)" }}
            >
              Open Media Library
            </button>
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={inputStyle}>
          <div className="text-sm font-semibold">Add by URL (optional)</div>
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <select
                value={urlType}
                onChange={(e) => onUrlTypeChange(e.target.value as any)}
                className="soft-ring rounded-2xl border px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
              <input
                value={urlValue}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="/uploads/..."
                className="soft-ring w-full rounded-2xl border px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={onAddUrl}
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              style={inputStyle}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4">
          <div className="text-sm font-semibold">Preview</div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {items
              .slice()
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((g, idx) => (
                <div
                  key={`${g.url}-${idx}`}
                  className="rounded-2xl border p-2"
                  style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface), 0.15)" }}
                >
                  <div className="aspect-square overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--card-border))" }}>
                    {g.type === "VIDEO" ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video className="h-full w-full object-cover" src={g.url} />
                    ) : (
                      <img className="h-full w-full object-cover" src={g.url} alt="preview" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs subtle-text">{g.type}</span>
                    <button type="button" onClick={() => onRemove(idx)} className="text-xs font-semibold underline underline-offset-4">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs subtle-text">No items yet.</div>
      )}
    </div>
  );
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

  const initialBefore = useMemo(() => (initialCase ? mediaFromKind(initialCase.media, "BEFORE") : []), [initialCase]);
  const initialAfter = useMemo(() => (initialCase ? mediaFromKind(initialCase.media, "AFTER") : []), [initialCase]);

  const [beforeItems, setBeforeItems] = useState<UiMedia[]>(initialBefore);
  const [afterItems, setAfterItems] = useState<UiMedia[]>(initialAfter);

  const [beforeUrl, setBeforeUrl] = useState("");
  const [beforeUrlType, setBeforeUrlType] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const [afterUrl, setAfterUrl] = useState("");
  const [afterUrlType, setAfterUrlType] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryFor, setLibraryFor] = useState<"BEFORE" | "AFTER" | null>(null);

  const inputStyle = {
    borderColor: "rgb(var(--card-border))",
    background: "rgba(var(--surface-2), 0.6)",
  } as const;

  function nextSort(items: UiMedia[]) {
    const max = items.reduce((m, x) => Math.max(m, x.sortOrder), -1);
    return max + 1;
  }

  async function handleFiles(kind: "BEFORE" | "AFTER", files: FileList | null) {
    if (!files || files.length === 0) return;

    setBusy(true);
    setError(null);

    try {
      const existing = kind === "BEFORE" ? beforeItems : afterItems;
      let sort = nextSort(existing);
      const uploads: UiMedia[] = [];

      for (const file of Array.from(files)) {
        const r = await uploadFile(file);
        uploads.push({ url: r.url, type: r.type, sortOrder: sort++ });
      }

      if (kind === "BEFORE") setBeforeItems((prev) => [...prev, ...uploads]);
      else setAfterItems((prev) => [...prev, ...uploads]);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function addUrl(kind: "BEFORE" | "AFTER") {
    if (kind === "BEFORE") {
      const u = beforeUrl.trim();
      if (!u) return;
      setBeforeItems((prev) => [...prev, { url: u, type: beforeUrlType, sortOrder: nextSort(prev) }]);
      setBeforeUrl("");
      setBeforeUrlType("IMAGE");
      return;
    }

    const u = afterUrl.trim();
    if (!u) return;
    setAfterItems((prev) => [...prev, { url: u, type: afterUrlType, sortOrder: nextSort(prev) }]);
    setAfterUrl("");
    setAfterUrlType("IMAGE");
  }

  function removeAt(kind: "BEFORE" | "AFTER", index: number) {
    if (kind === "BEFORE") {
      setBeforeItems((prev) => prev.filter((_, i) => i != index).map((x, i) => ({ ...x, sortOrder: i })));
    } else {
      setAfterItems((prev) => prev.filter((_, i) => i != index).map((x, i) => ({ ...x, sortOrder: i })));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const ysRaw = yearStart.trim();
    const yeRaw = yearEnd.trim();

    const ys = Number(ysRaw);
    const ye = yeRaw === "" ? ys : Number(yeRaw);

    if (!title || !brand || !model) {
      setBusy(false);
      setError("Title, brand, and model are required.");
      return;
    }

    if (!Number.isFinite(ys)) {
      setBusy(false);
      setError("Year start must be a number.");
      return;
    }

    if (yeRaw !== "" && !Number.isFinite(ye)) {
      setBusy(false);
      setError("Year end must be a number (or leave it empty).");
      return;
    }

    // Build media list with global sequential sortOrder (DB-safe if you have unique sortOrder per case)
    let s = 0;
    const before = beforeItems
      .slice()
      .filter((x) => x.url)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x) => ({ kind: "BEFORE" as const, type: x.type, url: x.url, sortOrder: s++ }));

    const after = afterItems
      .slice()
      .filter((x) => x.url)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x) => ({ kind: "AFTER" as const, type: x.type, url: x.url, sortOrder: s++ }));

    const media = [...before, ...after];

    const payload = { title, brand, model, yearStart: ys, yearEnd: ye, sku: sku || null, published, media };

    try {
      const url = mode === "create" ? "/api/admin/cases" : `/api/admin/cases/${initialCase!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

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

  const extraBrandOption = brand && !inBrandList(brand) ? brand : "";

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">{mode === "create" ? "New case" : "Edit case"}</h1>
          <p className="mt-2 text-sm subtle-text">Upload BEFORE and AFTER images/videos.</p>
        </div>
        <Link href="/admin" className="rounded-2xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90" style={inputStyle}>
          Back
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title *">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="soft-ring w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 dark:text-slate-100" style={inputStyle} required />
        </Field>

        <div className="flex items-end justify-between gap-3">
          <div className="w-full">
            <label className="text-sm font-semibold">Published</label>
            <div className="mt-2 flex items-center gap-2">
              <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              <label htmlFor="published" className="text-sm subtle-text">
                Visible in public gallery
              </label>
            </div>
          </div>
        </div>

        <Field label="Brand *">
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="brand-select soft-ring w-full rounded-2xl border px-4 py-3 text-sm" style={inputStyle} required>
            <option value="" disabled>
              Select a brand…
            </option>
            {extraBrandOption ? <option value={extraBrandOption}>{extraBrandOption}</option> : null}
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Model *">
          <input value={model} onChange={(e) => setModel(e.target.value)} className="soft-ring w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 dark:text-slate-100" style={inputStyle} required />
        </Field>

        <Field label="Year Start *">
          <input value={yearStart} onChange={(e) => setYearStart(e.target.value)} className="soft-ring w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 dark:text-slate-100" style={inputStyle} required />
        </Field>

        <Field label="Year End (optional)">
          <input value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} className="soft-ring w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 dark:text-slate-100" style={inputStyle} placeholder="Leave empty to use Year Start" />
        </Field>

        <Field label="SKU (optional)">
          <input value={sku ?? ""} onChange={(e) => setSku(e.target.value)} className="soft-ring w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 dark:text-slate-100" style={inputStyle} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title="BEFORE"
          subtitle="Upload BEFORE images/videos for this case."
          items={beforeItems}
          busy={busy}
          inputStyle={inputStyle}
          onFiles={(f) => handleFiles("BEFORE", f)}
          urlValue={beforeUrl}
          onUrlChange={setBeforeUrl}
          urlType={beforeUrlType}
          onUrlTypeChange={setBeforeUrlType}
          onAddUrl={() => addUrl("BEFORE")}
          onRemove={(i) => removeAt("BEFORE", i)}
          onOpenLibrary={() => setLibraryFor("BEFORE")}
        />

        <Section
          title="AFTER"
          subtitle="Upload AFTER images/videos for this case."
          items={afterItems}
          busy={busy}
          inputStyle={inputStyle}
          onFiles={(f) => handleFiles("AFTER", f)}
          urlValue={afterUrl}
          onUrlChange={setAfterUrl}
          urlType={afterUrlType}
          onUrlTypeChange={setAfterUrlType}
          onAddUrl={() => addUrl("AFTER")}
          onRemove={(i) => removeAt("AFTER", i)}
          onOpenLibrary={() => setLibraryFor("AFTER")}
        />
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <button
        disabled={busy}
        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-sky-500 dark:text-slate-900"
      >
        {busy ? "Saving…" : mode === "create" ? "Create case" : "Save changes"}
      </button>

      <div className="text-xs subtle-text">
        Uploads are saved into <code>public/uploads</code>. URLs are stored in DB.
      </div>
    </form>
  );
}
