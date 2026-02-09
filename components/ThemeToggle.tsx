"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition hover:opacity-90"
      style={{ borderColor: "rgb(var(--card-border))", background: "rgba(var(--card), 0.6)" }}
      title="Toggle theme"
    >
      <span className="text-xs font-semibold">{theme === "dark" ? "Dark" : "Light"}</span>
      <span aria-hidden className="text-xs opacity-70">/</span>
      <span className="text-xs opacity-80">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
