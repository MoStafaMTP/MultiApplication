// NOTE: In Next.js 15, page `params` is typed as a Promise in generated PageProps.
import Link from 'next/link'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import { getCaseById } from '@/src/lib/db'

export const runtime = 'nodejs'

type Props = { params: Promise<{ id: string }> }

export default async function CasePage({ params }: Props) {
  const c = await getCaseById((await params).id)
  if (!c) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Link href="/case" className="text-sm text-neutral-300 hover:text-neutral-100">← Back</Link>
        <h1 className="mt-4 text-2xl font-semibold">Case not found</h1>
      </main>
    )
  }

  const before = c.beforeImages[0]
  const after = c.afterImages[0]

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/case" className="text-sm text-neutral-300 hover:text-neutral-100">← Back</Link>
      <h1 className="mt-4 text-2xl font-semibold">{c.title}</h1>
      <div className="mt-1 text-neutral-400">
        {c.brand} · {c.model}
      </div>
      {c.description ? <p className="mt-3 text-neutral-200">{c.description}</p> : null}

      {before && after ? (
        <div className="mt-6">
          <BeforeAfterSlider beforeUrl={before} afterUrl={after} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
          This case does not have both a before and after image.
        </div>
      )}

      {(c.beforeImages.length > 1 || c.afterImages.length > 1) ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">Before images</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {c.beforeImages.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="Before" className="aspect-video w-full rounded-lg border border-neutral-800 object-cover" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold">After images</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {c.afterImages.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="After" className="aspect-video w-full rounded-lg border border-neutral-800 object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {c.videos.length ? (
        <div className="mt-8">
          <h2 className="font-semibold">Videos</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {c.videos.map((url) => (
              <video key={url} src={url} controls className="w-full rounded-xl border border-neutral-800" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10 text-xs text-neutral-500">
        ID: {c.id} · Updated: {new Date(c.updatedAt).toLocaleString()}
      </div>
    </main>
  )
}
