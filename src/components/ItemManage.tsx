"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateItemAction,
  addInventoryNoteAction,
  addToListAction,
  removeFromListAction,
  getListAction,
} from "@/app/actions";
import type { Item, InventoryNote } from "@/lib/types";

export function ItemManage({
  item,
  initialNotes,
}: {
  item: Item;
  initialNotes: InventoryNote[];
}) {
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category ?? "");
  const [defaultStore, setDefaultStore] = useState(item.defaultStore ?? "");
  const [inventoryNote, setInventoryNote] = useState("");
  const [notes, setNotes] = useState(initialNotes);
  const [onList, setOnList] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getListAction().then((list) => {
      const entry = list.find((e) => e.itemId === item.id);
      setOnList(!!entry);
    });
  }, [item.id]);

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await updateItemAction(item.id, new FormData(e.target as HTMLFormElement));
    setSaving(false);
    if (res.error) setMessage(res.error);
    else {
      setMessage("Saved.");
      router.refresh();
    }
  }

  async function handleAddInventory(e: React.FormEvent) {
    e.preventDefault();
    if (!inventoryNote.trim()) return;
    setSaving(true);
    setMessage(null);
    const res = await addInventoryNoteAction(item.id, inventoryNote.trim());
    setSaving(false);
    if (res.error) setMessage(res.error);
    else if (res.note) {
      setNotes((prev) => [res.note!, ...prev]);
      setInventoryNote("");
      setMessage("Inventory note added.");
      router.refresh();
    }
  }

  async function handleToggleList() {
    setSaving(true);
    setMessage(null);
    if (onList) {
      const ok = await removeFromListAction(item.id);
      if (ok) setOnList(false);
    } else {
      const res = await addToListAction(item.id);
      if (res.entry) setOnList(true);
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {item.name}
        </h1>
        <Link
          href="/items"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Back to items
        </Link>
      </div>

      {message && (
        <p className="text-sm text-[var(--success)] bg-[var(--success-bg)] rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Category & store
        </h2>
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Category (e.g. Produce)
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Produce"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <div>
            <label htmlFor="defaultStore" className="block text-sm font-medium text-[var(--muted)] mb-1">
              Default store (e.g. Costco)
            </label>
            <input
              id="defaultStore"
              name="defaultStore"
              type="text"
              value={defaultStore}
              onChange={(e) => setDefaultStore(e.target.value)}
              placeholder="Costco"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="tap-target rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[var(--foreground)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </section>

      <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Inventory
        </h2>
        <form onSubmit={handleAddInventory} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inventoryNote}
            onChange={(e) => setInventoryNote(e.target.value)}
            placeholder="e.g. 5 packets, Plenty"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
          />
          <button
            type="submit"
            disabled={saving || !inventoryNote.trim()}
            className="tap-target rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[var(--foreground)] disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {notes.length > 0 ? (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="text-sm text-[var(--muted)] flex justify-between"
              >
                <span>{n.note}</span>
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">No inventory notes yet.</p>
        )}
      </section>

      <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Shopping list
        </h2>
        <button
          type="button"
          onClick={handleToggleList}
          disabled={saving}
          className="tap-target rounded-xl border-2 border-[var(--border)] px-4 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50"
        >
          {onList ? "Remove from list" : "Add to list"}
        </button>
      </section>
    </div>
  );
}
