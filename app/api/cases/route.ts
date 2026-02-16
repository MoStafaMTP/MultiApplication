import { NextResponse } from 'next/server'
import { listCases } from '@/src/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const cases = await listCases()
  return NextResponse.json({ ok: true, cases })
}
