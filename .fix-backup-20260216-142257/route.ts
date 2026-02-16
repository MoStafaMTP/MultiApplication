import { NextResponse } from 'next/server'
import { requireAdminApi, rotateAdminPassword } from '@/src/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const ok = requireAdminApi(req)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as any
  const curr = String(body.curr ?? '').trim()
  const next = String(body.next ?? '').trim()

  if (!curr || !next) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (next.length < 6) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 })
  }

  const changed = await rotateAdminPassword(curr, next)
  if (!changed) return NextResponse.json({ error: 'Current password is wrong' }, { status: 401 })

  return NextResponse.json({ ok: true })
}
