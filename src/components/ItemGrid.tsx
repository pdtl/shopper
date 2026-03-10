"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getListAction, addToListAction, removeFromListAction, createItemAction } from "@/app/actions";
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
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const [onListIds, setOnListIds] = useState<Set<string>>(
    () => new Set(itemIdsOnList)
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const savedSearchTopRef = useRef<number | null>(null);

  // After each render, if a search-triggered scroll anchor was saved, restore it
  useLayoutEffect(() => {
    if (savedSearchTopRef.current !== null && searchRef.current) {
      const newTop = searchRef.current.getBoundingClientRect().top;
      const diff = newTop - savedSearchTopRef.current;
      if (diff !== 0) {
        window.scrollBy(0, diff);
      }
      savedSearchTopRef.current = null;
    }
  });

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

  const exactMatch = useMemo(() => {
    if (!searchText.trim()) return true;
    const term = searchText.trim().toLowerCase();
    return items.some((e) => e.name.toLowerCase() === term);
  }, [items, searchText]);

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

  async function handleCreateNew() {
    const name = searchText.trim();
    if (!name) return;
    setCreating(true);
    const fd = new FormData();
    fd.append("name", name);
    const result = await createItemAction(fd);
    setCreating(false);
    if (result.item) {
      router.push(`/items/${result.item.id}`);
    }
  }

  const groupedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const map = new Map<string | null, typeof sorted>();
    for (const item of sorted) {
      const key = item.category ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a.localeCompare(b);
    });
  }, [filteredItems]);

  function selectCategory(category: string | null) {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }

  function selectStore(store: string | null) {
    setSelectedStore((prev) => (prev === store ? null : store));
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
  const showAllCategories = selectedCategory === null;
  const showAllStores = selectedStore === null;

  return (
    <div className="space-y-4">
      {(hasStores || hasCategories) && (
        <div className="space-y-3">
          {hasCategories && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showAllCategories
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
          {hasStores && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectStore(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showAllStores
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                }`}
              >
                All
              </button>
              {stores.map((store) => {
                const active = selectedStore === store;
                return (
                  <button
                    key={store}
                    type="button"
                    onClick={() => selectStore(store)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                    }`}
                  >
                    {store}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={searchRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            if (searchRef.current) {
              savedSearchTopRef.current = searchRef.current.getBoundingClientRect().top;
            }
            setSearchText(e.target.value);
          }}
          placeholder="Find or create new"
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {searchText.trim() && !exactMatch && (
          <button
            type="button"
            onClick={handleCreateNew}
            disabled={creating}
            className="flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create New"}
          </button>
        )}
      </div>
      <div className="space-y-6">
        {groupedItems.map(([category, groupItems]) => (
          <div key={category ?? "__none__"}>
            {category && (
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2 px-1">
                {category}
              </h2>
            )}
            <ul className="space-y-1">
              {groupItems.map((item) => {
                const note = inventoryByItem[item.id];
                return (
                  <li key={item.id} className="flex items-center bg-[var(--card)] rounded-xl border border-[var(--border)] gap-2 px-2 py-1.5">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 min-w-0 flex items-center gap-2 no-underline"
                    >
                      <span className="font-medium text-[var(--foreground)] flex-shrink-0">
                        {item.name}
                      </span>
                      {(item.defaultStore || note) && (
                        <span className="text-xs text-[var(--muted)] flex items-center gap-1 min-w-0">
                          {item.defaultStore && <span className="truncate">{item.defaultStore}</span>}
                          {item.defaultStore && note && <span>·</span>}
                          {note && (
                            <span className="text-[var(--accent)] truncate">
                              Inventory: {note.note} · {timeAgo(note.createdAt)}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                      {onListIds.has(item.id) && (
                        <span className="text-xs tracking-wide uppercase text-[var(--success)]">On List</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleOnList(item.id, onListIds.has(item.id));
                        }}
                        className="flex-shrink-0 p-2 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
