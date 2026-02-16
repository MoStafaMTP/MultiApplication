'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-900"
      type="button"
    >
      Logout
    </button>
  )
}
