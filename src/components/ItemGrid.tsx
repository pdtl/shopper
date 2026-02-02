"use client";

import Link from "next/link";
import type { Item, InventoryNote } from "@/lib/types";

export function ItemGrid({
  items,
  inventoryByItem,
}: {
  items: Item[];
  inventoryByItem: Record<string, InventoryNote>;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">
        <p>No items yet.</p>
        <Link
          href="/items/new"
          className="mt-3 inline-block text-[var(--accent)] font-medium underline"
        >
          Add your first item
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const note = inventoryByItem[item.id];
        return (
          <li key={item.id}>
            <Link
              href={`/items/${item.id}`}
              className="block tap-target bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 no-underline hover:border-[var(--accent)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">
                {item.name}
              </span>
              {(item.category || item.defaultStore) && (
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {[item.category, item.defaultStore].filter(Boolean).join(" · ")}
                </p>
              )}
              {note && (
                <p className="text-sm text-[var(--accent)] mt-1">
                  Inventory: {note.note}
                </p>
              )}
            </Link>
          </li>
        );
      })}
      <li>
        <Link
          href="/items/new"
          className="block tap-target bg-[var(--card)] rounded-xl border-2 border-dashed border-[var(--border)] p-4 text-center text-[var(--muted)] font-medium no-underline hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          + Add new item
        </Link>
      </li>
    </ul>
  );
}
