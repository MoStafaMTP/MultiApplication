"use client";

import { ComparisonSlider } from "react-comparison-slider";
import Image from "next/image";

type Media = { type: "IMAGE" | "VIDEO"; url: string; posterUrl?: string | null };

function Video({ src, poster }: { src: string; poster?: string | null }) {
  return <video className="h-full w-full object-cover" src={src} poster={poster ?? undefined} controls playsInline preload="metadata" />;
}
function Img({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full">
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
    </div>
  );
}

export default function BeforeAfterSlider({
  before,
  after,
  alt,
  aspectRatio = 4 / 3,
  defaultValue = 50,
}: {
  before: Media;
  after: Media;
  alt: string;
  aspectRatio?: number | string;
  defaultValue?: number;
}) {
  const Item = ({ media, label }: { media: Media; label: "Before" | "After" }) => (
    <div className="relative h-full w-full overflow-hidden">
      {media.type === "VIDEO" ? <Video src={media.url} poster={media.posterUrl} /> : <Img src={media.url} alt={alt} />}
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
        {label}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <ComparisonSlider
        defaultValue={defaultValue}
        aspectRatio={aspectRatio}
        itemOne={<Item media={before} label="Before" />}
        itemTwo={<Item media={after} label="After" />}
      />
    </div>
  );
}
