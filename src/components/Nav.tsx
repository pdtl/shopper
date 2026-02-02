"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/list", label: "List" },
  { href: "/items", label: "Items" },
  { href: "/docs", label: "API" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] safe-area-inset-top">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-semibold text-lg text-[var(--foreground)] no-underline"
        >
          Shopper
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => {
            const active = path === href || (href !== "/" && path.startsWith(href));
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
