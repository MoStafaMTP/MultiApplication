'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Login failed')
      router.replace('/admin/cases')
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center p-6">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 shadow">
        <h1 className="text-xl font-semibold">Admin login</h1>
        <p className="mt-1 text-sm text-neutral-300">
          Default credentials are <span className="font-mono">admin / admin123</span>. Change them after first login.
        </p>

        <div className="mt-5 space-y-3">
          <label className="block text-sm">
            <div className="mb-1 text-neutral-300">Username</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-700"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1 text-neutral-300">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-700"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>
          )}

          <button
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Tip: set <span className="font-mono">AUTH_SECRET</span>, <span className="font-mono">ADMIN_USERNAME</span>, <span className="font-mono">ADMIN_PASSWORD</span> in <span className="font-mono">.env.local</span>.
        </div>
      </form>
    </main>
  )
}
