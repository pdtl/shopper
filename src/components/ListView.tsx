"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getListAction, setPickedUpAction, setUnavailableAction, setListEntryStoreAction, setListEntryQuantityAction, removeFromListAction, clearListAction } from "@/app/actions";
import type { Item, ListEntry } from "@/lib/types";

type ListItem = Item & ListEntry;

export function ListView({ initialList }: { initialList: ListItem[] }) {
  const [list, setList] = useState(initialList);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [removeConfirmItem, setRemoveConfirmItem] = useState<ListItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingStoreItemId, setEditingStoreItemId] = useState<string | null>(null);
  const [quantityModalItem, setQuantityModalItem] = useState<ListItem | null>(null);
  const [quantityInput, setQuantityInput] = useState("");

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
        new Set(
          list.flatMap((e) =>
            [e.defaultStore, e.storeOverride].filter((s): s is string => s != null && s !== "")
          )
        )
      ).sort(),
    [list]
  );

  const filteredList = useMemo(() => {
    let result = list;
    if (selectedStores.length > 0) {
      result = result.filter((e) => selectedStores.includes(e.storeOverride ?? e.defaultStore ?? ""));
    }
    if (selectedCategories.length > 0) {
      result = result.filter((e) => selectedCategories.includes(e.category ?? ""));
    }
    return result;
  }, [list, selectedStores, selectedCategories]);

  const pending = useMemo(() => filteredList.filter((e) => !e.pickedUp && !e.unavailable), [filteredList]);
  const unavailable = useMemo(() => filteredList.filter((e) => e.unavailable).sort((a, b) => a.name.localeCompare(b.name)), [filteredList]);
  const picked = useMemo(() => filteredList.filter((e) => e.pickedUp).sort((a, b) => a.name.localeCompare(b.name)), [filteredList]);

  const pendingGrouped = useMemo(() => {
    const sorted = [...pending].sort((a, b) => a.name.localeCompare(b.name));
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
  }, [pending]);

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  function toggleStore(store: string) {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
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

  async function handleStoreChange(itemId: string, store: string) {
    setEditingStoreItemId(null);
    const override = store || null;
    const { entry } = await setListEntryStoreAction(itemId, override);
    if (entry) {
      setList((prev) =>
        prev.map((e) => e.itemId === itemId ? { ...e, storeOverride: entry.storeOverride } : e)
      );
    }
  }

  async function handleQuantitySubmit() {
    if (!quantityModalItem) return;
    const val = parseInt(quantityInput, 10);
    if (!val || val < 1 || val > 99) return;
    const itemId = quantityModalItem.itemId;
    setQuantityModalItem(null);
    const { entry } = await setListEntryQuantityAction(itemId, val);
    if (entry) {
      setList((prev) =>
        prev.map((e) => e.itemId === itemId ? { ...e, quantity: entry.quantity } : e)
      );
    }
  }

  function openQuantityModal(entry: ListItem) {
    setQuantityInput(String(entry.quantity ?? 1));
    setQuantityModalItem(entry);
  }

  function renderStoreIcon(entry: ListItem) {
    const effectiveStore = entry.storeOverride ?? entry.defaultStore;
    if (!effectiveStore) return null;
    if (editingStoreItemId === entry.itemId) {
      return (
        <select
          autoFocus
          defaultValue={entry.storeOverride ?? ""}
          onChange={(ev) => handleStoreChange(entry.itemId, ev.target.value)}
          onBlur={() => setEditingStoreItemId(null)}
          onClick={(ev) => ev.stopPropagation()}
          className="text-[var(--foreground)] bg-[var(--card)] border border-[var(--accent)] rounded px-1 text-xs focus:outline-none"
        >
          <option value="">Default ({entry.defaultStore || "none"})</option>
          {stores.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setEditingStoreItemId(entry.itemId)}
        className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        title={`Store: ${effectiveStore}. Tap to change.`}
        aria-label={`Store: ${effectiveStore}. Tap to change store for this trip.`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
        </svg>
      </button>
    );
  }

  async function confirmClearList() {
    setShowClearConfirm(false);
    const { ok } = await clearListAction();
    if (ok) setList([]);
  }

  const totalListCount = filteredList.length;
  const pickedCount = picked.length;
  const unavailableCount = unavailable.length;
  const pickedPercent = totalListCount > 0 ? (pickedCount / totalListCount) * 100 : 0;
  const unavailablePercent = totalListCount > 0 ? (unavailableCount / totalListCount) * 100 : 0;

  const hasCategories = categories.length > 0;
  const hasStores = stores.length > 0;

  return (
    <>
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
                onClick={() => setSelectedCategories([])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.length === 0
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          {hasStores && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedStores([])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedStores.length === 0
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                }`}
              >
                All
              </button>
              {stores.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => toggleStore(store)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedStores.includes(store)
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/30"
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          )}
          {/* Progress bar */}
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
          {/* To get — grouped by category */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-[var(--muted)] mb-2">To get</h2>
              <div className="space-y-4">
                {pendingGrouped.map(([category, entries]) => (
                  <div key={category ?? "__none__"}>
                    {category && (
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1 px-1">
                        {category}
                      </h3>
                    )}
                    <ul className="space-y-1">
                      {entries.map((entry) => (
                        <li
                          key={entry.itemId}
                          className="flex items-center bg-[var(--card)] rounded-xl border border-[var(--border)] gap-2 px-2 py-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => togglePicked(entry.itemId, false)}
                            className="flex flex-shrink-0 items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors p-0.5"
                            aria-label={`Mark ${entry.name} as picked up`}
                          >
                            <span className="block rounded-full border-2 border-[var(--accent)] bg-transparent w-5 h-5" aria-hidden />
                          </button>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openQuantityModal(entry)}
                              className="font-medium text-[var(--foreground)] hover:underline flex-shrink-0 text-left"
                              aria-label={`${entry.name} — Quantity: ${entry.quantity ?? 1}. Tap to change.`}
                            >
                              {entry.name}
                            </button>
                            <button
                              type="button"
                              onClick={() => openQuantityModal(entry)}
                              className="flex-shrink-0 text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-opacity text-left"
                              aria-hidden
                            >
                              {entry.quantity ?? 1}<span className="text-[0.6rem] text-[var(--muted)] ml-0.5">{entry.defaultUnit}</span>
                            </button>
                            <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                              {renderStoreIcon(entry)}
                              <button
                                type="button"
                                onClick={() => toggleUnavailable(entry.itemId, false)}
                                className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--unavailable)]/20 hover:text-[var(--unavailable)] transition-colors"
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
                                className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
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
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Unavailable — alphabetical */}
          {unavailable.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-[var(--unavailable)] mb-2">Unavailable</h2>
              <ul className="space-y-1">
                {unavailable.map((entry) => (
                  <li
                    key={entry.itemId}
                    className="flex items-center bg-[var(--unavailable-bg)] rounded-xl border border-[var(--unavailable)]/30 opacity-90 gap-2 px-2 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleUnavailable(entry.itemId, true)}
                      className="flex flex-shrink-0 items-center justify-center rounded-full hover:opacity-80 transition-opacity p-0.5"
                      aria-label={`Mark ${entry.name} as available`}
                    >
                      <span className="flex items-center justify-center rounded-full bg-[var(--unavailable)] w-5 h-5" aria-hidden>
                        <svg className="text-white w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth={2.5} d="M7 7l10 10M17 7l-10 10" />
                        </svg>
                      </span>
                    </button>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openQuantityModal(entry)}
                        className="font-medium text-[var(--foreground)] hover:underline line-through flex-shrink-0 text-left"
                        aria-label={`${entry.name} — Quantity: ${entry.quantity ?? 1}. Tap to change.`}
                      >
                        {entry.name}
                      </button>
                      <span className="flex-shrink-0 text-sm font-medium text-[var(--muted)]">
                        {entry.quantity ?? 1}<span className="text-[0.6rem] ml-0.5">{entry.defaultUnit}</span>
                      </span>
                      <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                        {renderStoreIcon(entry)}
                        <button
                          type="button"
                          onClick={() => togglePicked(entry.itemId, false)}
                          className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--success)]/20 hover:text-[var(--success)] transition-colors"
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
                          className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
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
          {/* Picked up — alphabetical */}
          {picked.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-[var(--muted)] mb-2">Picked up</h2>
              <ul className="space-y-1">
                {picked.map((entry) => (
                  <li
                    key={entry.itemId}
                    className="flex items-center bg-[var(--success-bg)] rounded-xl border border-[var(--success)]/30 opacity-90 gap-2 px-2 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => togglePicked(entry.itemId, true)}
                      className="flex flex-shrink-0 items-center justify-center rounded-full hover:opacity-80 transition-opacity p-0.5"
                      aria-label={`Uncheck ${entry.name}`}
                    >
                      <span className="flex items-center justify-center rounded-full bg-[var(--success)] w-5 h-5" aria-hidden>
                        <svg className="text-white w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openQuantityModal(entry)}
                        className="font-medium text-[var(--foreground)] hover:underline line-through flex-shrink-0 text-left"
                        aria-label={`${entry.name} — Quantity: ${entry.quantity ?? 1}. Tap to change.`}
                      >
                        {entry.name}
                      </button>
                      <span className="flex-shrink-0 text-sm font-medium text-[var(--muted)]">
                        {entry.quantity ?? 1}<span className="text-[0.6rem] ml-0.5">{entry.defaultUnit}</span>
                      </span>
                      <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                        {renderStoreIcon(entry)}
                        <button
                          type="button"
                          onClick={() => setRemoveConfirmItem(entry)}
                          className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] transition-colors"
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

      {quantityModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setQuantityModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qty-modal-title"
        >
          <div
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl max-w-xs w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="qty-modal-title" className="text-base font-semibold text-[var(--foreground)] mb-1">
              {quantityModalItem.name}
            </h2>
            <p className="text-xs text-[var(--muted)] mb-4">{quantityModalItem.defaultUnit}</p>
            <input
              type="number"
              min={1}
              max={99}
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleQuantitySubmit(); if (e.key === "Escape") setQuantityModalItem(null); }}
              autoFocus
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] text-center text-xl mb-4 focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setQuantityModalItem(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuantitySubmit}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
