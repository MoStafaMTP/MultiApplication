"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Media = { type: "IMAGE" | "VIDEO"; url: string; posterUrl?: string | null };

function MediaView({ media, alt }: { media: Media; alt: string }) {
  if (media.type === "VIDEO") {
    return (
      <video
        className="h-full w-full object-cover"
        src={media.url}
        poster={media.posterUrl ?? undefined}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      src={media.url}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 700px"
      className="object-cover"
    />
  );
}

function normalizeAspectRatio(ar: number | string) {
  if (typeof ar === "number") return String(ar); // e.g. "1.3333"
  const s = ar.trim();
  if (s.includes(":")) {
    const [a, b] = s.split(":").map((x) => x.trim());
    if (a && b) return `${a} / ${b}`; // CSS aspect-ratio
  }
  return s; // allow "4 / 3"
}

export default function BeforeAfterSlider({
  before,
  after,
  alt,
  aspectRatio = 4 / 3,
  defaultValue = 50,
  showLabels = true,
}: {
  before: Media;
  after: Media;
  alt: string;
  aspectRatio?: number | string;
  defaultValue?: number; // 0-100
  showLabels?: boolean;
}) {
  const [value, setValue] = useState<number>(Math.min(100, Math.max(0, defaultValue)));
  const ratio = useMemo(() => normalizeAspectRatio(aspectRatio), [aspectRatio]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        {/* After = base */}
        <div className="absolute inset-0">
          <MediaView media={after} alt={alt} />
          {showLabels && (
            <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              After
            </div>
          )}
        </div>

        {/* Before = clipped overlay */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${value}%` }}
          aria-hidden="true"
        >
          <div className="relative h-full w-full">
            <MediaView media={before} alt={alt} />
            {showLabels && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                Before
              </div>
            )}
          </div>
        </div>

        {/* Divider line + handle */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${value}%`, transform: "translateX(-1px)" }}
        >
          <div className="h-full w-[2px] bg-white/80 shadow" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-black/40 px-3 py-2 text-xs text-white shadow">
            ⇆
          </div>
        </div>

        {/* Range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Before after slider"
          className="absolute inset-0 h-full w-full cursor-col-resize opacity-0"
        />
      </div>
    </div>
  );
}
