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
import { FeedbackModal } from "@/components/FeedbackModal";

/* Links always visible on mobile */
const primaryLinks = [
  { href: "/list", label: "List" },
  { href: "/items", label: "Items" },
];

/* Links that move into the hamburger menu on mobile */
const secondaryLinks = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "API" },
];

export function Nav() {
  const path = usePathname();
  const [theme, setTheme] = useState<ThemeId>("default");
  const [themeOpen, setThemeOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  /* Close theme dropdown on outside click */
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

  /* Close hamburger menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  function pickTheme(id: ThemeId) {
    setStoredTheme(id);
    setTheme(id);
    setThemeOpen(false);
  }

  function isActive(href: string) {
    return path === href || (href !== "/" && path.startsWith(href));
  }

  const linkClass = (href: string) =>
    `tap-target px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
      isActive(href)
        ? "bg-[var(--accent)] text-[var(--foreground)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
    }`;

  const currentThemeLabel = THEMES.find((t) => t.id === theme)?.label ?? "Warm";

  return (
    <>
    <nav className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] safe-area-inset-top">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-semibold text-lg text-[var(--foreground)] no-underline"
        >
          Shopper
        </Link>
        <div className="flex items-center gap-2">
          {/* Desktop-only: theme, feedback, secondary links */}
          <div className="hidden sm:flex items-center gap-2">
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
                  className="absolute right-0 top-full mt-1 py-1 min-w-[10rem] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-20"
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
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="tap-target px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              aria-label="Send feedback"
            >
              Feedback
            </button>
            {secondaryLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </div>

          {/* Always visible: List & Items */}
          {primaryLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}

          {/* Mobile-only: hamburger menu */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="tap-target p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="5" y1="5" x2="15" y2="15" />
                    <line x1="15" y1="5" x2="5" y2="15" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="17" y2="6" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="3" y1="14" x2="17" y2="14" />
                  </>
                )}
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 py-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-20">
                {secondaryLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2 text-sm no-underline transition-colors ${
                      isActive(href)
                        ? "bg-[var(--accent)] text-[var(--foreground)] font-medium"
                        : "text-[var(--foreground)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <div className="border-t border-[var(--border)] my-1" />
                <button
                  type="button"
                  onClick={() => { setFeedbackOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                >
                  Feedback
                </button>
                <div className="border-t border-[var(--border)] my-1" />
                <div className="px-4 py-1.5 text-xs text-[var(--muted)]">Theme</div>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { pickTheme(t.id); setMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === t.id
                        ? "bg-[var(--accent)] text-[var(--foreground)] font-medium"
                        : "text-[var(--foreground)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}
