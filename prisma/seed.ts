import { PrismaClient, MediaKind, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.case.count();
  if (existing > 0) return;

  await prisma.case.create({
    data: {
      title: "Ford Expedition – Driver Bottom (Ebony)",
      brand: "Ford",
      model: "Expedition",
      yearStart: 2018,
      yearEnd: 2020,
      sku: "SAMPLE-SKU-001",
      published: true,
      media: {
        create: [
          { kind: MediaKind.BEFORE, type: MediaType.IMAGE, url: "/cases/demo-before-1.jpg", sortOrder: 0 },
          { kind: MediaKind.AFTER, type: MediaType.IMAGE, url: "/cases/demo-after-1.jpg", sortOrder: 0 },
        ],
      },
    },
  });

  await prisma.case.create({
    data: {
      title: "Chevrolet Tahoe – Front Row (Tan)",
      brand: "Chevrolet",
      model: "Tahoe",
      yearStart: 2015,
      yearEnd: 2019,
      sku: "SAMPLE-SKU-002",
      published: true,
      media: {
        create: [{ kind: MediaKind.GALLERY, type: MediaType.VIDEO, url: "/cases/demo-transform-1.mp4", sortOrder: 0 }],
      },
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
