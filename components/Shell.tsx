import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Shell({ children, rightSlot }: { children: React.ReactNode; rightSlot?: React.ReactNode }) {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  return (
    <div className="min-h-dvh">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.18), transparent 55%)," +
            "radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.16), transparent 55%)," +
            "radial-gradient(900px 600px at 50% 90%, rgba(99,102,241,0.10), transparent 60%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-9 w-auto" />
          ) : (
            <div className="h-9 w-9 rounded-2xl border" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.5)" }} />
          )}

          <div>
            <div className="text-xl font-black tracking-tight">Dashboard</div>
            <div className="text-xs subtle-text">Before / After Images</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rightSlot}
          <Link
            href="/admin"
            className="rounded-2xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
            style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }}
          >
            Admin
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 text-xs subtle-text">
        © 2026 United Seat Factory • All Rights Reserved
      </footer>
    </div>
  );
}
