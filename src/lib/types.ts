export type PublicMedia = {
  id: string;
  kind: "BEFORE" | "AFTER" | "GALLERY";
  type: "IMAGE" | "VIDEO";
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
