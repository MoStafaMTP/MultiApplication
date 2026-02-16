import Link from 'next/link'
import { requireAdminPage } from '@/src/lib/auth-server'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  requireAdminPage()

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/cases" className="text-sm font-semibold">Admin Panel</Link>
            <nav className="flex items-center gap-3 text-sm text-neutral-300">
              <Link href="/admin/cases" className="hover:text-neutral-100">Cases</Link>
              <Link href="/admin/media" className="hover:text-neutral-100">Media Library</Link>
            </nav>
          </div>

          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  )
}
