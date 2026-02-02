"use client";

import { useState } from "react";
import Link from "next/link";
import { setPickedUpAction } from "@/app/actions";
import type { Item, ListEntry } from "@/lib/types";

type ListItem = Item & ListEntry;

export function ListView({ initialList }: { initialList: ListItem[] }) {
  const [list, setList] = useState(initialList);

  async function togglePicked(itemId: string, current: boolean) {
    const res = await setPickedUpAction(itemId, !current);
    if (res.entry) {
      setList((prev) =>
        prev.map((e) =>
          e.itemId === itemId ? { ...e, pickedUp: res.entry!.pickedUp } : e
        )
      );
    }
  }

  const pending = list.filter((e) => !e.pickedUp);
  const picked = list.filter((e) => e.pickedUp);

  if (list.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">
        <p>Your list is empty.</p>
        <Link
          href="/items"
          className="mt-3 inline-block text-[var(--accent)] font-medium underline"
        >
          Add items from your item list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  className="tap-target w-6 h-6 rounded-full border-2 border-[var(--accent)] bg-transparent flex-shrink-0 hover:bg-[var(--accent)]/20 transition-colors"
                  aria-label={`Mark ${entry.name} as picked up`}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/items/${entry.id}`}
                    className="font-medium text-[var(--foreground)] no-underline hover:underline"
                  >
                    {entry.name}
                  </Link>
                  {(entry.category || entry.defaultStore) && (
                    <p className="text-sm text-[var(--muted)] truncate">
                      {[entry.category, entry.defaultStore].filter(Boolean).join(" · ")}
                    </p>
                  )}
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
                  className="tap-target w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center flex-shrink-0 hover:opacity-80"
                  aria-label={`Uncheck ${entry.name}`}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/items/${entry.id}`}
                    className="font-medium text-[var(--foreground)] no-underline line-through hover:underline"
                  >
                    {entry.name}
                  </Link>
                  {(entry.category || entry.defaultStore) && (
                    <p className="text-sm text-[var(--muted)] truncate">
                      {[entry.category, entry.defaultStore].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
