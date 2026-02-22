"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getListAction, addToListAction, removeFromListAction } from "@/app/actions";
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [onListIds, setOnListIds] = useState<Set<string>>(
    () => new Set(itemIdsOnList)
  );

  // Refetch list when this page is shown so we always see fresh on-list status
  // after navigating away and back (avoids stale client-side router cache).
  useEffect(() => {
    getListAction().then((list) => {
      setOnListIds(new Set(list.map((e) => e.itemId)));
    });
  }, []);

  async function toggleOnList(itemId: string, currentlyOnList: boolean) {
    if (currentlyOnList) {
      const { ok } = await removeFromListAction(itemId);
      if (ok) setOnListIds((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
    } else {
      const { entry } = await addToListAction(itemId);
      if (entry) setOnListIds((prev) => new Set(prev).add(itemId));
    }
  }

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
    if (searchText) {
      const term = searchText.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(term));
    }
    if (selectedStore) {
      result = result.filter((e) => e.defaultStore === selectedStore);
    }
    if (selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }
    return result;
  }, [items, searchText, selectedStore, selectedCategory]);

  function selectCategory(category: string | null) {
    setSelectedCategory((prev) => (prev === category ? null : category));
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
  const showAll = selectedCategory === null;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search items..."
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
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
                onClick={() => selectCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showAll
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => selectCategory(cat)}
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
                    onListIds.has(item.id)
                      ? "text-xs tracking-wide uppercase text-[var(--success)]"
                      : "text-xs tracking-wide uppercase text-[var(--muted)]"
                  }
                >
                  {onListIds.has(item.id) ? "On List" : "Not on List"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOnList(item.id, onListIds.has(item.id));
                  }}
                  className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
                  aria-label={onListIds.has(item.id) ? `Remove ${item.name} from list` : `Add ${item.name} to list`}
                  title={onListIds.has(item.id) ? "Remove from list" : "Add to list"}
                >
                  {onListIds.has(item.id) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
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
