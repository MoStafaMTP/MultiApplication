import { prisma as __prisma } from "./prisma";

function __getCaseModel(p: any) {
  return p?.case ?? p?.cases ?? p?.Case ?? p?.BeforeAfterCase ?? p?.beforeAfterCase;
}

export async function listCases() {
  const p: any = __prisma as any;
  const m: any = __getCaseModel(p);
  if (!m?.findMany) return [];
  try {
    return await m.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return await m.findMany();
  }
}

export async function getCaseById(id: string) {
  const p: any = __prisma as any;
  const m: any = __getCaseModel(p);
  if (!m) return null;

  try {
    if (m.findUnique) return await m.findUnique({ where: { id } });
  } catch {}

  try {
    if (m.findFirst) return await m.findFirst({ where: { id } });
  } catch {}

  return null;
}

// --- v2 additions: CRUD helpers used by admin API routes ---

export async function createCase(data: any) {
  const p: any = __prisma as any;
  const m: any = __getCaseModel(p);
  if (!m?.create) throw new Error("Prisma model for cases not found");
  return m.create({ data });
}

export async function updateCase(id: string, data: any) {
  const p: any = __prisma as any;
  const m: any = __getCaseModel(p);
  if (!m?.update) throw new Error("Prisma model for cases not found");
  return m.update({ where: { id }, data });
}

export async function deleteCase(id: string) {
  const p: any = __prisma as any;
  const m: any = __getCaseModel(p);
  if (!m?.delete) throw new Error("Prisma model for cases not found");
  return m.delete({ where: { id } });
}
