"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItemAction, addToListAction } from "@/app/actions";

export function CreateItemForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [defaultStore, setDefaultStore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(addToList: boolean) {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("category", category.trim() || "");
    formData.set("defaultStore", defaultStore.trim() || "");
    const res = await createItemAction(formData);
    if (res.error) {
      setError(res.error);
      setSaving(false);
      return;
    }
    if (res.item && addToList) {
      await addToListAction(res.item.id);
    }
    router.push("/items");
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSave(true); }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-4"
    >
      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--muted)] mb-1">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Bananas"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-[var(--muted)] mb-1">
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Produce"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
        />
      </div>
      <div>
        <label htmlFor="defaultStore" className="block text-sm font-medium text-[var(--muted)] mb-1">
          Default store
        </label>
        <input
          id="defaultStore"
          name="defaultStore"
          type="text"
          value={defaultStore}
          onChange={(e) => setDefaultStore(e.target.value)}
          placeholder="e.g. Costco"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="tap-target rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[var(--foreground)] disabled:opacity-50 text-left"
        >
          {saving ? "Saving…" : "Save and add to list"}
        </button>
        <button
          type="button"
          disabled={saving || !name.trim()}
          onClick={() => handleSave(false)}
          className="tap-target rounded-xl border border-[var(--border)] px-4 py-2 font-medium text-[var(--foreground)] disabled:opacity-50 text-left hover:bg-[var(--border)]"
        >
          Save and close
        </button>
        <Link
          href="/items"
          className="tap-target rounded-xl border border-[var(--border)] px-4 py-2 font-medium text-[var(--muted)] no-underline hover:bg-[var(--border)] text-left"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
