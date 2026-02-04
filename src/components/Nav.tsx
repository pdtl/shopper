"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  THEMES,
  getStoredTheme,
  setStoredTheme,
  type ThemeId,
} from "@/lib/theme";

const links = [
  { href: "/", label: "Home" },
  { href: "/list", label: "List" },
  { href: "/items", label: "Items" },
  { href: "/docs", label: "API" },
];

export function Nav() {
  const path = usePathname();
  const [theme, setTheme] = useState<ThemeId>("default");
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!themeOpen) return;
    function close(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [themeOpen]);

  function pickTheme(id: ThemeId) {
    setStoredTheme(id);
    setTheme(id);
    setThemeOpen(false);
  }

  const currentThemeLabel = THEMES.find((t) => t.id === theme)?.label ?? "Warm";

  return (
    <nav className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] safe-area-inset-top">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-semibold text-lg text-[var(--foreground)] no-underline"
        >
          Shopper
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setThemeOpen((o) => !o)}
              className="tap-target px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              aria-expanded={themeOpen}
              aria-haspopup="listbox"
              aria-label="Theme"
            >
              {currentThemeLabel}
            </button>
            {themeOpen && (
              <ul
                role="listbox"
                className="absolute left-0 top-full mt-1 py-1 min-w-[10rem] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-20"
              >
                {THEMES.map((t) => (
                  <li key={t.id} role="option" aria-selected={theme === t.id}>
                    <button
                      type="button"
                      onClick={() => pickTheme(t.id)}
                      className={`tap-target w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                        theme === t.id
                          ? "bg-[var(--accent)] text-[var(--foreground)] font-medium"
                          : "text-[var(--foreground)] hover:bg-[var(--border)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {links.map(({ href, label }) => {
            const active =
              path === href || (href !== "/" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`tap-target px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
