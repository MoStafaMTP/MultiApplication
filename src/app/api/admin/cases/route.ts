import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/api/admin/_requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cases = await prisma.case.findMany({ orderBy: { createdAt: "desc" }, include: { media: true } });
  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, brand, model, yearStart, yearEnd, sku, published, media } = body;

  if (!title || !brand || !model) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!Number.isFinite(yearStart) || !Number.isFinite(yearEnd)) return NextResponse.json({ error: "Invalid years" }, { status: 400 });

  const created = await prisma.case.create({
    data: {
      title,
      brand,
      model,
      yearStart,
      yearEnd,
      sku: sku ?? null,
      published: Boolean(published),
      media: {
        create: Array.isArray(media)
          ? media.filter((m: any) => m?.url && m?.kind && m?.type).map((m: any) => ({ kind: m.kind, type: m.type, url: m.url, sortOrder: m.sortOrder ?? 0 }))
          : [],
      },
    },
    include: { media: true },
  });

  return NextResponse.json(created);
}
