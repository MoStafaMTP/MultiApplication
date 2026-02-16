import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/src/lib/auth'
import { saveUploadedFile } from '@/src/lib/media'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!requireAdminApi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  const result = await saveUploadedFile(file)
  return NextResponse.json({ ok: true, ...result })
}
