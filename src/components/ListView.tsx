"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getListAction, setPickedUpAction, setUnavailableAction, removeFromListAction, clearListAction } from "@/app/actions";
import type { Item, ListEntry } from "@/lib/types";

type ListItem = Item & ListEntry;

export function ListView({ initialList }: { initialList: ListItem[] }) {
  const [list, setList] = useState(initialList);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [removeConfirmItem, setRemoveConfirmItem] = useState<ListItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Refetch list when this page is shown so we always see fresh picked/shopped state
  // after navigating away and back (avoids stale client-side router cache).
  useEffect(() => {
    getListAction().then((fresh) => setList(fresh));
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(list.map((e) => e.category).filter((c): c is string => c != null))
      ).sort(),
    [list]
  );

  const stores = useMemo(
    () =>
      Array.from(
        new Set(list.map((e) => e.defaultStore).filter((s): s is string => s != null))
      ).sort(),
    [list]
  );

  const filteredList = useMemo(() => {
    let result = list;
    if (selectedStore) {
      result = result.filter((e) => e.defaultStore === selectedStore);
    }
    if (selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }
    return result;
  }, [list, selectedStore, selectedCategory]);

  function selectCategory(category: string | null) {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }

  async function togglePicked(itemId: string, current: boolean) {
    const res = await setPickedUpAction(itemId, !current);
    if (res.entry) {
      setList((prev) =>
        prev.map((e) =>
          e.itemId === itemId ? { ...e, pickedUp: res.entry!.pickedUp, unavailable: res.entry!.unavailable } : e
        )
      );
    }
  }

  async function toggleUnavailable(itemId: string, current: boolean) {
    const res = await setUnavailableAction(itemId, !current);
    if (res.entry) {
      setList((prev) =>
        prev.map((e) =>
          e.itemId === itemId ? { ...e, unavailable: res.entry!.unavailable, pickedUp: res.entry!.pickedUp } : e
        )
      );
    }
  }

  async function confirmRemoveFromList() {
    if (!removeConfirmItem) return;
    const itemId = removeConfirmItem.itemId;
    setRemoveConfirmItem(null);
    const { ok } = await removeFromListAction(itemId);
    if (ok) {
      setList((prev) => prev.filter((e) => e.itemId !== itemId));
    }
  }

  async function confirmClearList() {
    setShowClearConfirm(false);
    const { ok } = await clearListAction();
    if (ok) setList([]);
  }

  const pending = filteredList.filter((e) => !e.pickedUp && !e.unavailable);
  const unavailable = filteredList.filter((e) => e.unavailable);
  const picked = filteredList.filter((e) => e.pickedUp);

  const totalListCount = list.length;
  const pickedCount = list.filter((e) => e.pickedUp).length;
  const unavailableCount = list.filter((e) => e.unavailable).length;
  const pickedPercent = totalListCount > 0 ? (pickedCount / totalListCount) * 100 : 0;
  const unavailablePercent = totalListCount > 0 ? (unavailableCount / totalListCount) * 100 : 0;

  const showAll = selectedCategory === null;
  const hasCategories = categories.length > 0;
  const hasStores = stores.length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Shopping list
        </h1>
        {hasStores && (
          <select
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
        )}
      </div>
      <p className="text-[var(--muted)] mb-6">
        Check off items as you pick them up.
      </p>
      {list.length === 0 ? (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">
          <p>Your list is empty.</p>
          <Link
            href="/items"
            className="mt-3 inline-block text-[var(--accent)] font-medium underline"
          >
            Add items from your item list
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
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
          {/* Progress bar: picked + unavailable vs total on full list */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Progress</span>
              <span className="font-medium text-[var(--foreground)]">
                {pickedCount} picked{unavailableCount > 0 && <>, {unavailableCount} unavailable</>} — {totalListCount} total
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden flex"
              role="progressbar"
              aria-valuenow={pickedCount}
              aria-valuemin={0}
              aria-valuemax={totalListCount}
              aria-label={`${pickedCount} of ${totalListCount} items picked, ${unavailableCount} unavailable`}
            >
              <div
                className="h-full bg-[var(--success)] transition-all duration-300 ease-out"
                style={{ width: `${pickedPercent}%` }}
              />
              <div
                className="h-full bg-[var(--unavailable)] transition-all duration-300 ease-out"
                style={{ width: `${unavailablePercent}%` }}
              />
            </div>
          </div>
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] mb-2">
            To get
          </h2>
          <ul className="space-y-1">
            {pending.map((entry) => (
              <li
                key={entry.itemId}
                className="flex items-center gap-3 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
              >
                <button
                  type="button"
                  onClick={() => togglePicked(entry.itemId, false)}
                  className="tap-target flex flex-shrink-0 items-center justify-center rounded-full p-2 sm:p-0 hover:bg-[var(--accent)]/20 transition-colors"
                  aria-label={`Mark ${entry.name} as picked up`}
                >
                  <span className="block w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 border-[var(--accent)] bg-transparent" aria-hidden />
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/items/${entry.id}`}
                    className="font-medium text-[var(--foreground)] no-underline hover:underline"
                  >
                    {entry.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(entry.category || entry.defaultStore) && (
                      <span className="text-sm text-[var(--muted)] truncate">
                        {[entry.category, entry.defaultStore].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleUnavailable(entry.itemId, false)}
                      className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--unavailable)]/20 hover:text-[var(--unavailable)] transition-colors"
                      aria-label={`Mark ${entry.name} as unavailable`}
                      title="Mark unavailable"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        <path strokeLinecap="round" strokeWidth={2} d="M9 9l6 6M15 9l-6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveConfirmItem(entry)}
                      className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
                      aria-label={`Remove ${entry.name} from list`}
                      title="Remove from list"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {unavailable.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[var(--unavailable)] mb-2">
            Unavailable
          </h2>
          <ul className="space-y-1">
            {unavailable.map((entry) => (
              <li
                key={entry.itemId}
                className="flex items-center gap-3 bg-[var(--unavailable-bg)] rounded-xl border border-[var(--unavailable)]/30 p-4 opacity-90"
              >
                <button
                  type="button"
                  onClick={() => toggleUnavailable(entry.itemId, true)}
                  className="tap-target flex flex-shrink-0 items-center justify-center rounded-full p-2 sm:p-0 hover:opacity-80 transition-opacity"
                  aria-label={`Mark ${entry.name} as available`}
                >
                  <span className="flex w-7 h-7 sm:w-6 sm:h-6 items-center justify-center rounded-full bg-[var(--unavailable)]" aria-hidden>
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeWidth={2.5} d="M7 7l10 10M17 7l-10 10" />
                    </svg>
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/items/${entry.id}`}
                    className="font-medium text-[var(--foreground)] no-underline line-through hover:underline"
                  >
                    {entry.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(entry.category || entry.defaultStore) && (
                      <span className="text-sm text-[var(--muted)] truncate">
                        {[entry.category, entry.defaultStore].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => togglePicked(entry.itemId, false)}
                      className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--success)]/20 hover:text-[var(--success)] transition-colors"
                      aria-label={`Mark ${entry.name} as picked up`}
                      title="Mark as picked up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveConfirmItem(entry)}
                      className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
                      aria-label={`Remove ${entry.name} from list`}
                      title="Remove from list"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {picked.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] mb-2">
            Picked up
          </h2>
          <ul className="space-y-1">
            {picked.map((entry) => (
              <li
                key={entry.itemId}
                className="flex items-center gap-3 bg-[var(--success-bg)] rounded-xl border border-[var(--success)]/30 p-4 opacity-90"
              >
                <button
                  type="button"
                  onClick={() => togglePicked(entry.itemId, true)}
                  className="tap-target flex flex-shrink-0 items-center justify-center rounded-full p-2 sm:p-0 hover:opacity-80 transition-opacity"
                  aria-label={`Uncheck ${entry.name}`}
                >
                  <span className="flex w-7 h-7 sm:w-6 sm:h-6 items-center justify-center rounded-full bg-[var(--success)]" aria-hidden>
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/items/${entry.id}`}
                    className="font-medium text-[var(--foreground)] no-underline line-through hover:underline"
                  >
                    {entry.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(entry.category || entry.defaultStore) && (
                      <span className="text-sm text-[var(--muted)] truncate">
                        {[entry.category, entry.defaultStore].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setRemoveConfirmItem(entry)}
                      className="tap-target flex-shrink-0 p-1 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
                      aria-label={`Remove ${entry.name} from list`}
                      title="Remove from list"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
          <div className="pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-3 px-4 rounded-xl text-sm font-medium text-[var(--muted)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--border)]/30 hover:text-[var(--foreground)] transition-colors"
            >
              Clear list
            </button>
          </div>
        </div>
      )}

      {removeConfirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setRemoveConfirmItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-confirm-title"
          aria-describedby="remove-confirm-desc"
        >
          <div
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="remove-confirm-title" className="text-lg font-semibold text-[var(--foreground)]">
              Remove from list?
            </h2>
            <p id="remove-confirm-desc" className="mt-2 text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">{removeConfirmItem.name}</strong> will be removed from your shopping list. You can add it back from the Items page.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRemoveConfirmItem(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveFromList}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowClearConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-confirm-title"
          aria-describedby="clear-confirm-desc"
        >
          <div
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="clear-confirm-title" className="text-lg font-semibold text-[var(--foreground)]">
              Clear list?
            </h2>
            <p id="clear-confirm-desc" className="mt-2 text-[var(--muted)]">
              All items will be removed from your shopping list. You can add them back from the Items page.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearList}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Clear list
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
