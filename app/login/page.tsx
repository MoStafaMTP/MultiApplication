"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error ?? "Login failed");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <div className="text-xl font-black tracking-tight">Login</div>
        <div className="mt-1 text-sm subtle-text">Please sign in to access the gallery.</div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Username</label>
            <input
              className="mt-2 w-full rounded-2xl border px-4 py-3 bg-transparent"
              style={{ borderColor: "rgb(var(--card-border))" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border px-4 py-3 bg-transparent"
              style={{ borderColor: "rgb(var(--card-border))" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err ? (
            <div className="text-sm" style={{ color: "rgb(239,68,68)" }}>
              {err}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl border px-4 py-3 font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
