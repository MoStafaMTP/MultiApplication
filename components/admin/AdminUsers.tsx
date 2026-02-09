"use client";

import { useEffect, useState } from "react";

type U = { id: string; username: string; role: "ADMIN" | "USER"; createdAt: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/admin/users");
    setLoading(false);
    if (!res.ok) {
      setErr("Failed to load users");
      return;
    }
    const j = await res.json().catch(() => ({}));
    setUsers(j.users ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Create failed");
      return;
    }

    setNewUsername("");
    setNewPassword("");
    setNewRole("USER");
    setOkMsg("User created");
    await load();
  }

  async function changePassword(id: string) {
    const p = prompt("New password:");
    if (!p) return;

    const res = await fetch(`/api/admin/users/${id}/password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newPassword: p }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(j?.error ?? "Password update failed");
      return;
    }
    alert("Password updated");
  }

  return (
    <div className="card p-6 space-y-6">
      <form onSubmit={addUser} className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-1">
          <label className="text-sm font-semibold">Username</label>
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: "rgb(var(--card-border))" }}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: "rgb(var(--card-border))" }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-semibold">Role</label>
          <select
            className="mt-2 w-full rounded-2xl border px-4 py-3 bg-transparent"
            style={{ borderColor: "rgb(var(--card-border))" }}
            value={newRole}
            onChange={(e) => setNewRole((e.target.value as any) || "USER")}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            className="w-full rounded-2xl border px-4 py-3 font-semibold transition hover:opacity-90"
            style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.6)" }}
          >
            Add User
          </button>
        </div>
      </form>

      {err ? (
        <div className="text-sm" style={{ color: "rgb(239,68,68)" }}>
          {err}
        </div>
      ) : null}
      {okMsg ? (
        <div className="text-sm" style={{ color: "rgb(34,197,94)" }}>
          {okMsg}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgb(var(--card-border))" }}>
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold" style={{ background: "rgba(var(--surface-2), 0.4)" }}>
          <div className="col-span-5">Username</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm subtle-text">Loading...</div>
        ) : users.length === 0 ? (
          <div className="px-4 py-6 text-sm subtle-text">No users.</div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
              style={{ borderTop: "1px solid rgb(var(--card-border))" }}
            >
              <div className="col-span-5 font-semibold">{u.username}</div>
              <div className="col-span-2 subtle-text">{u.role}</div>
              <div className="col-span-3 subtle-text">{new Date(u.createdAt).toLocaleString()}</div>
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => changePassword(u.id)}
                  className="rounded-2xl border px-3 py-2 text-xs font-semibold transition hover:opacity-90"
                  style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--surface-2), 0.35)" }}
                >
                  Change Password
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-xs subtle-text">
        Open <span className="font-semibold">/admin/users</span> to manage users.
      </div>
    </div>
  );
}
