'use client'

import { useEffect, useMemo, useState } from 'react'

type MediaType = 'image' | 'video'

type MediaItem = {
  url: string
  type: MediaType
  filename: string
  size: number
  modifiedAt: string
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | MediaType>('all')

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load media')
      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((it) => {
      if (type !== 'all' && it.type !== type) return false
      if (!query) return true
      return it.filename.toLowerCase().includes(query)
    })
  }, [items, q, type])

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Upload failed')
      }
      await refresh()
    } catch (e: any) {
      setError(e?.message || 'Upload error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm text-neutral-300">Upload or browse media used in cases.</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-64 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <button
              onClick={refresh}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">
          Upload files
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <div className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {filtered.map((it) => (
          <div key={it.url} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
              {it.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.url} alt={it.filename} className="h-full w-full object-cover" />
              ) : (
                <video src={it.url} className="h-full w-full object-cover" muted controls={false} />
              )}
            </div>
            <div className="mt-2 truncate text-xs text-neutral-300" title={it.filename}>
              {it.filename}
            </div>
            <div className="text-[11px] text-neutral-500">{it.type}</div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="col-span-full text-sm text-neutral-500">No media found.</div>}
      </div>
    </div>
  )
}
