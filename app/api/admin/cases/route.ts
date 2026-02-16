import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/src/lib/auth'
import { createCase, listCases } from '@/src/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  if (!requireAdminApi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cases = await listCases()
  return NextResponse.json({ ok: true, cases })
}

export async function POST(req: Request) {
  if (!requireAdminApi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as any
  const title = String(body.title ?? '').trim()
  const brand = String(body.brand ?? '').trim()
  const model = String(body.model ?? '').trim()
  const description = String(body.description ?? '').trim()

  if (!title || !brand || !model) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const beforeImages = Array.isArray(body.beforeImages) ? body.beforeImages.map(String) : []
  const afterImages = Array.isArray(body.afterImages) ? body.afterImages.map(String) : []
  const videos = Array.isArray(body.videos) ? body.videos.map(String) : []

  const created = await createCase({ title, brand, model, description, beforeImages, afterImages, videos })
  return NextResponse.json({ ok: true, case: created }, { status: 201 })
}
