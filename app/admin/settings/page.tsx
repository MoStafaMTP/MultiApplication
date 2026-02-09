"use client";

import { useState } from "react";

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (newPassword.length < 4) { setErr("New password must be at least 4 characters."); return; }
    if (newPassword !== confirm) { setErr("Confirm password does not match."); return; }

    setBusy(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setBusy(false);

    if (res.ok) {
      setMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setErr(data?.error ?? "Failed to update password");
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-6">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-sm subtle-text">Change admin password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Current password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="soft-ring mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }} required />
          </div>

          <div>
            <label className="text-sm font-semibold">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="soft-ring mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }} required />
          </div>

          <div>
            <label className="text-sm font-semibold">Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="soft-ring mt-1 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }} required />
          </div>

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
          {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div> : null}

          <button disabled={busy} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-sky-500 dark:text-slate-900">
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
