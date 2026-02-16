export type MediaKind = "BEFORE" | "AFTER" | "GALLERY";
export type MediaType = "IMAGE" | "VIDEO";

export type PublicMedia = {
  id: string;
  kind: MediaKind;
  type: MediaType;
  url: string;
  posterUrl?: string | null;
  sortOrder: number;
};

export type PublicCase = {
  id: string;
  title: string;
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  sku?: string | null;
  published: boolean;
  media: PublicMedia[];
};
