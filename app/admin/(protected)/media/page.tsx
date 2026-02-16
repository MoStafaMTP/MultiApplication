import MediaManager from '@/components/admin/MediaManager'

export const runtime = 'nodejs'

export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Media library</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Files here are used by the “Add case” picker. Existing files live in <code>public/media</code>.
      </p>
      <div className="mt-4">
        <MediaManager />
      </div>
    </div>
  )
}
