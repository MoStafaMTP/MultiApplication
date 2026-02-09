"use client";

import Image from "next/image";
import type { PublicMedia } from "@/lib/types";

export default function CasePrimaryMedia({ media, alt }: { media: PublicMedia[]; alt: string }) {
  const first = media[0];
  if (!first) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        No media
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {first.type === "VIDEO" ? (
          <video className="h-full w-full object-cover" src={first.url} poster={first.posterUrl ?? undefined} controls playsInline preload="metadata" />
        ) : (
          <Image src={first.url} alt={alt} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
        )}
      </div>
    </div>
  );
}
