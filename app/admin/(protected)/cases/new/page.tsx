import AdminCaseForm from '@/components/admin/AdminCaseForm'

export const runtime = 'nodejs'

export default function NewCasePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">New case</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Add before/after images and videos. You can upload new files or pick existing ones from the Media Library.
      </p>
      <div className="mt-6">
        <AdminCaseForm mode="create" />
      </div>
    </div>
  )
}
