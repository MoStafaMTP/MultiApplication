export type SeatCoverCase = {
  id: string;
  title: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  material?: string;
  color?: string;
  position?: string; // e.g. "Driver Bottom", "Front Row", "2nd Row"
  sku?: string;
  beforeSrc: string;
  afterSrc: string;
  productUrl?: string;
  tags: string[];
};

export const demoCases: SeatCoverCase[] = [
  {
    id: "expedition-2018-ebony-driver-bottom",
    title: "Ford Expedition – Driver Bottom (Ebony)",
    make: "Ford",
    model: "Expedition",
    yearStart: 2018,
    yearEnd: 2020,
    material: "Leather",
    color: "Ebony",
    position: "Driver Bottom",
    sku: "SAMPLE-SKU-001",
    beforeSrc: "/cases/demo-before-1.jpg",
    afterSrc: "/cases/demo-after-1.jpg",
    productUrl: "https://example.com/products/sample",
    tags: ["OEM-style", "factory-match", "leather"],
  },
  {
    id: "tahoe-2015-tan-front-row",
    title: "Chevrolet Tahoe – Front Row (Tan)",
    make: "Chevrolet",
    model: "Tahoe",
    yearStart: 2015,
    yearEnd: 2019,
    material: "Leatherette",
    color: "Tan",
    position: "Front Row",
    sku: "SAMPLE-SKU-002",
    beforeSrc: "/cases/demo-before-2.jpg",
    afterSrc: "/cases/demo-after-2.jpg",
    tags: ["before-after", "restore"],
  },
];
