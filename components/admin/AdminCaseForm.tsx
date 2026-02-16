'use client'

import { useMemo, useState } from 'react'
import { MediaLibraryModal } from './MediaLibraryModal'

export type CaseFormInitial = {
  id?: string
  title?: string
  brand?: string
  model?: string
  description?: string
  beforeImages?: string[]
  afterImages?: string[]
  videos?: string[]
}

type PickerTarget = 'before' | 'after' | 'video'

type UploadResult = { url: string }

async function uploadFiles(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data: UploadResult & { error?: string } = await res.json()
    if (!res.ok || !data?.url) throw new Error(data?.error ?? 'Upload failed')
    urls.push(data.url)
  }
  return urls
}

export default function AdminCaseForm({
  mode,
  initial,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initial?: CaseFormInitial
  onSaved?: (id: string) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const [beforeImages, setBeforeImages] = useState<string[]>(initial?.beforeImages ?? [])
  const [afterImages, setAfterImages] = useState<string[]>(initial?.afterImages ?? [])
  const [videos, setVideos] = useState<string[]>(initial?.videos ?? [])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('before')

  const pickerConfig = useMemo(() => {
    if (pickerTarget === 'video') return { allowTypes: ['video'] as const, title: 'Select videos from Media Library' }
    return { allowTypes: ['image'] as const, title: 'Select images from Media Library' }
  }, [pickerTarget])

  function addFromLibrary(urls: string[]) {
    if (pickerTarget === 'before') setBeforeImages((prev) => [...prev, ...urls])
    else if (pickerTarget === 'after') setAfterImages((prev) => [...prev, ...urls])
    else setVideos((prev) => [...prev, ...urls])
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        model: model.trim(),
        description: description.trim() || undefined,
        beforeImages,
        afterImages,
        videos,
      }

      const endpoint = mode === 'create' ? '/api/admin/cases' : `/api/admin/cases/${initial?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Save failed')
      const id = (data?.case?.id ?? initial?.id) as string | undefined
      if (id) {
        if (onSaved) onSaved(id)
        else window.location.assign(`/admin/cases/${id}`)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function renderMediaList(urls: string[], type: 'image' | 'video', onRemove: (url: string) => void) {
    if (urls.length === 0) return <div className="text-sm text-neutral-500">None added yet.</div>
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {urls.map((url) => (
          <div key={url} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
            <div className="aspect-video bg-neutral-900">
              {type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={url} className="h-full w-full object-cover" controls preload="metadata" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="truncate text-xs text-neutral-300">{url}</div>
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <MediaLibraryModal
        open={pickerOpen}
        allowTypes={[...pickerConfig.allowTypes]}
        title={pickerConfig.title}
        onClose={() => setPickerOpen(false)}
        onConfirm={addFromLibrary}
      />

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
              placeholder="e.g. 2012-2015 Lincoln MKX Seat Covers"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
              placeholder="e.g. Auto Seat Factory"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
              placeholder="e.g. Lincoln MKX"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* BEFORE */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Before images</h2>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900">
              Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? [])
                  if (files.length === 0) return
                  try {
                    setBusy(true)
                    const urls = await uploadFiles(files)
                    setBeforeImages((p) => [...p, ...urls])
                  } catch (err: any) {
                    setError(err?.message ?? 'Upload failed')
                  } finally {
                    setBusy(false)
                    e.target.value = ''
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPickerTarget('before')
                setPickerOpen(true)
              }}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900"
            >
              Add from Media Library
            </button>
          </div>
        </div>

        <div className="mt-4">
          {renderMediaList(beforeImages, 'image', (u) => setBeforeImages((p) => p.filter((x) => x !== u)))}
        </div>
      </div>

      {/* AFTER */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">After images</h2>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900">
              Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? [])
                  if (files.length === 0) return
                  try {
                    setBusy(true)
                    const urls = await uploadFiles(files)
                    setAfterImages((p) => [...p, ...urls])
                  } catch (err: any) {
                    setError(err?.message ?? 'Upload failed')
                  } finally {
                    setBusy(false)
                    e.target.value = ''
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPickerTarget('after')
                setPickerOpen(true)
              }}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900"
            >
              Add from Media Library
            </button>
          </div>
        </div>

        <div className="mt-4">
          {renderMediaList(afterImages, 'image', (u) => setAfterImages((p) => p.filter((x) => x !== u)))}
        </div>
      </div>

      {/* VIDEOS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Videos</h2>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900">
              Upload
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? [])
                  if (files.length === 0) return
                  try {
                    setBusy(true)
                    const urls = await uploadFiles(files)
                    setVideos((p) => [...p, ...urls])
                  } catch (err: any) {
                    setError(err?.message ?? 'Upload failed')
                  } finally {
                    setBusy(false)
                    e.target.value = ''
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPickerTarget('video')
                setPickerOpen(true)
              }}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-900"
            >
              Add from Media Library
            </button>
          </div>
        </div>

        <div className="mt-4">
          {renderMediaList(videos, 'video', (u) => setVideos((p) => p.filter((x) => x !== u)))}
        </div>
      </div>

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-md bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
        >
          {busy ? 'Saving...' : mode === 'create' ? 'Create case' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
