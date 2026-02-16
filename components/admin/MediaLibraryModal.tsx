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

export function MediaLibraryModal({
  open,
  allowTypes,
  title,
  onClose,
  onConfirm,
}: {
  open: boolean
  allowTypes: MediaType[]
  title: string
  onClose: () => void
  onConfirm: (urls: string[]) => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/media', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? 'Failed to load media')
        setItems(Array.isArray(data?.items) ? data.items : [])
        setSelected({})
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load media')
      } finally {
        setLoading(false)
      }
    })()
  }, [open])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return items.filter((it) => {
      if (!allowTypes.includes(it.type)) return false
      if (!qq) return true
      return it.filename.toLowerCase().includes(qq) || it.url.toLowerCase().includes(qq)
    })
  }, [items, allowTypes, q])

  const selectedUrls = useMemo(() => {
    return Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
  }, [selected])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-xs text-neutral-400">Select one or more items, then click Add</div>
          </div>
          <button onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900">
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search filename..."
              className="w-full max-w-sm rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
            />
            <div className="ml-auto text-sm text-neutral-400">{selectedUrls.length} selected</div>
          </div>

          <div className="mt-4 min-h-[280px]">
            {loading ? (
              <div className="text-sm text-neutral-400">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-neutral-400">No media found. Upload some in Admin → Media first.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((it) => {
                  const isSelected = !!selected[it.url]
                  return (
                    <button
                      key={it.url}
                      type="button"
                      onClick={() => setSelected((p) => ({ ...p, [it.url]: !p[it.url] }))}
                      className={
                        'group relative overflow-hidden rounded-xl border bg-neutral-950 text-left ' +
                        (isSelected ? 'border-neutral-100' : 'border-neutral-800 hover:border-neutral-600')
                      }
                    >
                      <div className="aspect-video bg-neutral-900">
                        {it.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.url} alt={it.filename} className="h-full w-full object-cover" />
                        ) : (
                          <video src={it.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                        )}
                      </div>
                      <div className="p-2">
                        <div className="truncate text-xs text-neutral-200">{it.filename}</div>
                        <div className="mt-0.5 text-[11px] text-neutral-500">
                          {it.type.toUpperCase()} • {Math.round(it.size / 1024)} KB
                        </div>
                      </div>
                      <div className="absolute right-2 top-2 rounded-full bg-neutral-950/80 px-2 py-1 text-[11px] text-neutral-200">
                        {isSelected ? 'Selected' : 'Pick'}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 p-4">
          <button onClick={onClose} className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedUrls)
              onClose()
            }}
            disabled={selectedUrls.length === 0}
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
