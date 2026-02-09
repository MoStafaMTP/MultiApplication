import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../_requireAdmin";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, brand, model, yearStart, yearEnd, sku, published, media } = body;
  const data: any = {};

  if (typeof title === "string") data.title = title;
  if (typeof brand === "string") data.brand = brand;
  if (typeof model === "string") data.model = model;
  if (Number.isFinite(yearStart)) data.yearStart = yearStart;
  if (Number.isFinite(yearEnd)) data.yearEnd = yearEnd;
  if (sku === null || typeof sku === "string") data.sku = sku;
  if (typeof published === "boolean") data.published = published;

  if (Array.isArray(media)) {
    await prisma.media.deleteMany({ where: { caseId: params.id } });
    data.media = {
      create: media
        .filter((m: any) => m?.url && m?.kind && m?.type)
        .map((m: any) => ({ kind: m.kind, type: m.type, url: m.url, sortOrder: m.sortOrder ?? 0 })),
    };
  }

  const updated = await prisma.case.update({ where: { id: params.id }, data, include: { media: true } });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.case.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
