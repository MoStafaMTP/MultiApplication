'use client'

import { useMemo, useState } from 'react'

export default function BeforeAfterSlider({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
  const [pct, setPct] = useState(50)
  const safePct = useMemo(() => Math.min(100, Math.max(0, pct)), [pct])

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800">
        <img src={afterUrl} alt="After" className="absolute inset-0 h-full w-full object-contain bg-neutral-900" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${safePct}%` }}>
          <img src={beforeUrl} alt="Before" className="h-full w-full object-contain bg-neutral-900" />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${safePct}%` }}>
          <div className="h-full w-[2px] bg-neutral-100/70" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-neutral-400">Before</span>
        <input
          type="range"
          min={0}
          max={100}
          value={safePct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-neutral-400">After</span>
      </div>
    </div>
  )
}
