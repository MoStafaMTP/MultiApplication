import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/src/lib/auth'
import { listMedia } from '@/src/lib/media'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  if (!requireAdminApi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await listMedia()
  return NextResponse.json({ ok: true, items })
}
