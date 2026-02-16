import { NextResponse } from 'next/server'
import { createSessionToken, getCookieName, setSessionCookie } from '@/src/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const u = String(body.username ?? body.u ?? '').trim()
    const p = String(body.password ?? body.p ?? '').trim()
    if (!u || !p) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const token = await createSessionToken(u, p)
    if (!token) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    setSessionCookie(res, token)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
