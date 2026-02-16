import Link from 'next/link'
import { listCases } from '@/src/lib/db'

export const runtime = 'nodejs'

export default async function PublicCasesPage() {
  const cases = await listCases()
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Cases</h1>
      <p className="mt-2 text-neutral-300">Click a case to view its before/after media.</p>
      <div className="mt-6 grid gap-3">
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/case/${c.id}`}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 hover:bg-neutral-900"
          >
            <div className="font-medium">{c.title}</div>
            <div className="mt-1 text-sm text-neutral-400">
              {c.brand} · {c.model}
            </div>
          </Link>
        ))}
        {cases.length === 0 && (
          <div className="text-sm text-neutral-400">No cases yet. Add one in the admin panel.</div>
        )}
      </div>
    </main>
  )
}
