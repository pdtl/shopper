"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Item, InventoryNote } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

export function ItemGrid({
  items,
  inventoryByItem,
  itemIdsOnList,
}: {
  items: Item[];
  inventoryByItem: Record<string, InventoryNote>;
  itemIdsOnList: string[];
}) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<string>("");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((e) => e.category).filter((c): c is string => c != null))
      ).sort(),
    [items]
  );

  const stores = useMemo(
    () =>
      Array.from(
        new Set(items.map((e) => e.defaultStore).filter((s): s is string => s != null))
      ).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedStore) {
      result = result.filter((e) => e.defaultStore === selectedStore);
    }
    if (selectedCategories.size > 0) {
      result = result.filter(
        (e) => e.category != null && selectedCategories.has(e.category)
      );
    }
    return result;
  }, [items, selectedStore, selectedCategories]);

  function toggleCategory(category: string | null) {
    if (category == null) {
      setSelectedCategories(new Set());
      return;
    }
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

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

  const hasCategories = categories.length > 0;
  const hasStores = stores.length > 0;
  const showAll = selectedCategories.size === 0;

  return (
    <div className="space-y-4">
      {(hasStores || hasCategories) && (
        <div className="space-y-3">
          {hasStores && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="items-store-filter" className="text-sm text-[var(--muted)]">
                Store:
              </label>
              <select
                id="items-store-filter"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                aria-label="Filter by store"
              >
                <option value="">All</option>
                {stores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasCategories && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showAll
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const active = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Link
        href="/items/new"
        className="block tap-target bg-[var(--card)] rounded-xl border-2 border-dashed border-[var(--border)] p-4 text-center text-[var(--muted)] font-medium no-underline hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
      >
        + Add new item
      </Link>
      <ul className="space-y-2">
      {filteredItems.map((item) => {
        const note = inventoryByItem[item.id];
        return (
          <li key={item.id}>
            <Link
              href={`/items/${item.id}`}
              className="block tap-target bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 no-underline hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[var(--foreground)]">
                  {item.name}
                </span>
                <span
                  className={
                    itemIdsOnList.includes(item.id)
                      ? "text-xs tracking-wide uppercase text-[var(--success)]"
                      : "text-xs tracking-wide uppercase text-[var(--muted)]"
                  }
                >
                  {itemIdsOnList.includes(item.id) ? "On List" : "Not on List"}
                </span>
              </div>
              {(item.category || item.defaultStore) && (
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {[item.category, item.defaultStore].filter(Boolean).join(" · ")}
                </p>
              )}
              {note && (
                <p className="text-sm text-[var(--accent)] mt-1">
                  Inventory: {note.note}
                  <span className="text-[var(--muted)] font-normal">
                    {" "}
                    · {timeAgo(note.createdAt)}
                  </span>
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
    </div>
  );
}
