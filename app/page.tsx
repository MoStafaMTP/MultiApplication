import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Seat Cover Before/After</h1>
      <p className="mt-2 text-neutral-300">
        Minimal demo project: public case pages + admin panel.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/login"
          className="rounded-xl bg-neutral-800 px-4 py-2 hover:bg-neutral-700"
        >
          Admin Login
        </Link>
        <Link
          href="/admin/cases"
          className="rounded-xl border border-neutral-800 px-4 py-2 hover:border-neutral-700"
        >
          View Cases
        </Link>
      </div>
    </main>
  )
}
