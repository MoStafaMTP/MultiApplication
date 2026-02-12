"use client";

import { useState, useEffect, useCallback } from "react";

type MediaItem = {
  url: string;
  name: string;
  size: number;
  type: "IMAGE" | "VIDEO";
  date: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? `Failed to upload ${file.name}`);
        }
      }
      await loadMedia();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(url: string) {
    if (!confirm(`Are you sure you want to delete this file?\n\n${url}`)) return;

    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to delete");
      }
      await loadMedia();
      setSelected(new Set());
    } catch (e: any) {
      setError(e?.message ?? "Delete failed");
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.size} file(s)?`)) return;

    try {
      for (const url of selected) {
        const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? `Failed to delete ${url}`);
        }
      }
      await loadMedia();
      setSelected(new Set());
    } catch (e: any) {
      setError(e?.message ?? "Bulk delete failed");
    }
  }

  function toggleSelect(url: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelected(newSelected);
  }

  function copyUrl(url: string) {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert("URL copied to clipboard!");
  }

  const filtered = items.filter((item) => filter === "ALL" || item.type === filter);

  const inputStyle = {
    borderColor: "rgb(var(--card-border))",
    background: "rgba(var(--surface-2), 0.6)",
  } as const;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <p className="mt-1 text-sm subtle-text">Select one or multiple files to upload.</p>
        </div>
        <label
          className="inline-flex cursor-pointer items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{ ...inputStyle, cursor: uploading ? "not-allowed" : "pointer" }}
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          {uploading ? "Uploading..." : "Choose Files"}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                filter === "ALL" ? "opacity-100" : "opacity-60 hover:opacity-90"
              }`}
              style={inputStyle}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter("IMAGE")}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                filter === "IMAGE" ? "opacity-100" : "opacity-60 hover:opacity-90"
              }`}
              style={inputStyle}
            >
              Images ({items.filter((i) => i.type === "IMAGE").length})
            </button>
            <button
              onClick={() => setFilter("VIDEO")}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                filter === "VIDEO" ? "opacity-100" : "opacity-60 hover:opacity-90"
              }`}
              style={inputStyle}
            >
              Videos ({items.filter((i) => i.type === "VIDEO").length})
            </button>
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:opacity-90"
            >
              Delete Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="card p-12 text-center text-sm subtle-text">Loading media...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-sm subtle-text">No media files found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <div
              key={item.url}
              className={`group relative overflow-hidden rounded-2xl border transition ${
                selected.has(item.url) ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.25)" }}
            >
              {/* Checkbox */}
              <div className="absolute left-2 top-2 z-10">
                <input
                  type="checkbox"
                  checked={selected.has(item.url)}
                  onChange={() => toggleSelect(item.url)}
                  className="h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Media Preview */}
              <div className="aspect-square overflow-hidden bg-neutral-100">
                {item.type === "VIDEO" ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white">
                        <span className="text-lg">▶</span>
                      </div>
                      <span className="text-xs subtle-text">Video</span>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>

              {/* Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <div className="text-xs text-white">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="mt-1 text-white/70">{formatSize(item.size)} • {formatDate(item.date)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="rounded-xl border bg-white px-2 py-1 text-xs font-semibold transition hover:opacity-90"
                  style={{ borderColor: "rgb(var(--card-border))" }}
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(item.url)}
                  className="rounded-xl border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:opacity-90"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

