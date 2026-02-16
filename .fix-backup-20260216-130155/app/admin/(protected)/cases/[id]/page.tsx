import AdminCaseForm from '@/components/admin/AdminCaseForm'
import { getCaseById } from '@/src/lib/db'

export const runtime = 'nodejs'

type Props = { params: { id: string } }

export default async function EditCasePage({ params }: Props) {
  const c = await getCaseById(params.id)
  if (!c) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Case not found</h1>
        <p className="mt-2 text-neutral-400">ID: {params.id}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Edit case</h1>
      <p className="mt-1 text-sm text-neutral-400">ID: {c.id}</p>
      <div className="mt-6">
        <AdminCaseForm
          mode="edit"
          initial={{
            id: c.id,
            title: c.title,
            brand: c.brand,
            model: c.model,
            description: c.description,
            beforeImages: c.beforeImages,
            afterImages: c.afterImages,
            videos: c.videos,
          }}
        />
      </div>
    </div>
  )
}
