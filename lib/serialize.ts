import type { Case, Media } from "@prisma/client";
import type { PublicCase, PublicMedia } from "@/lib/types";

export function toPublicCase(c: Case & { media: Media[] }): PublicCase {
  const media: PublicMedia[] = (c.media ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      id: m.id,
      kind: m.kind === "GALLERY" ? "BEFORE" : m.kind,
      type: m.type,
      url: m.url,
      posterUrl: m.posterUrl,
      sortOrder: m.sortOrder,
    }));

  return {
    id: c.id,
    title: c.title,
    brand: c.brand,
    model: c.model,
    yearStart: c.yearStart,
    yearEnd: c.yearEnd,
    sku: c.sku,
    published: c.published,
    media,
  };
}
