import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCookieName, verifySessionToken } from './auth'

export function requireAdminPage() {
  const token = cookies().get(getCookieName())?.value
  const session = verifySessionToken(token)
  if (!session) redirect('/admin/login')
  return session
}
