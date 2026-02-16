import Link from 'next/link'
import { listCases } from '@/src/lib/db'

// NOTE: Keep this type minimal for the table; extend as needed.
type CaseListItem = {
  id: string;
  title: string;
  brand: string;
  createdAt?: string | Date | null;
  status?: string | null;
};


export const runtime = 'nodejs'

export default async function AdminCasesPage() {
  const cases = await listCases()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cases</h1>
        <Link href="/admin/cases/new" className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-950 hover:opacity-90">
          Add Case
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-200">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Model</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td className="p-4 text-neutral-300" colSpan={5}>
                  No cases yet.
                </td>
              </tr>
            ) : (
              cases.map((c: CaseListItem) => (
                <tr key={c.id} className="border-t border-neutral-800">
                  <td className="p-3">{c.title}</td>
                  <td className="p-3">{c.brand}</td>
                  <td className="p-3">{c.model}</td>
                  <td className="p-3 text-neutral-300">{new Date(c.updatedAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link href={`/admin/cases/${c.id}`} className="rounded-md border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
                        Edit
                      </Link>
                      <Link href={`/case/${c.id}`} className="rounded-md border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
