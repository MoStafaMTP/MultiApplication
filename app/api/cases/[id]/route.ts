import { NextResponse } from 'next/server'
import { getCaseById } from '@/src/lib/db'

export const runtime = 'nodejs'

type Ctx = { params: { id: string } }

export async function GET(_req: Request, ) {
  // Next.js 15 passes dynamic route params as a Promise in route handlers.
  const params = await ctx.params;
  const rec = await getCaseById(params.id)
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true, case: rec })
}
