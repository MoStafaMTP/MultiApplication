"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);

    if (res.ok) {
      window.location.href = "/admin";
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error ?? "Login failed");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter the admin password (from <code className="rounded bg-neutral-100 px-1">.env</code>).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-neutral-400"
          placeholder="••••••••"
          required
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
