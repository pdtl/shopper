import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { mkdirSync } from "fs";
import path from "path";
import * as schema from "./schema";
import type { Item, ListEntry, InventoryNote } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.sqlite");
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new BetterSqlite3(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    category TEXT,
    default_store TEXT,
    created_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS list_entries (
    item_id TEXT PRIMARY KEY REFERENCES items(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    picked_up INTEGER NOT NULL DEFAULT 0,
    unavailable INTEGER NOT NULL DEFAULT 0,
    store_override TEXT,
    added_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inventory_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    item_id TEXT NOT NULL REFERENCES items(id),
    note TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Migrations for existing databases
try { sqlite.exec(`ALTER TABLE items ADD COLUMN deleted_at TEXT`); } catch { /* column already exists */ }
try { sqlite.exec(`ALTER TABLE items ADD COLUMN default_unit TEXT NOT NULL DEFAULT 'packet'`); } catch { /* column already exists */ }
try { sqlite.exec(`ALTER TABLE items ADD COLUMN default_quantity INTEGER NOT NULL DEFAULT 1`); } catch { /* column already exists */ }
try { sqlite.exec(`ALTER TABLE list_entries ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1`); } catch { /* column already exists */ }

export const db = drizzle(sqlite, { schema });

function randomId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// --- Items ---

export async function getAllItems(userId: string): Promise<Item[]> {
  return db
    .select()
    .from(schema.items)
    .where(and(eq(schema.items.userId, userId), isNull(schema.items.deletedAt)))
    .orderBy(desc(schema.items.createdAt));
}

export async function getItemById(
  userId: string,
  id: string
): Promise<Item | null> {
  return (
    db
      .select()
      .from(schema.items)
      .where(and(eq(schema.items.id, id), eq(schema.items.userId, userId), isNull(schema.items.deletedAt)))
      .get() ?? null
  );
}

export async function createItem(
  userId: string,
  input: {
    name: string;
    category?: string | null;
    defaultStore?: string | null;
    defaultUnit?: string;
    defaultQuantity?: number;
  }
): Promise<Item> {
  const item = {
    id: randomId(),
    userId,
    name: input.name.trim(),
    category: input.category?.trim() || null,
    defaultStore: input.defaultStore?.trim() || null,
    defaultUnit: input.defaultUnit?.trim() || "packet",
    defaultQuantity: input.defaultQuantity ?? 1,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };
  db.insert(schema.items).values(item).run();
  return item;
}

export async function updateItem(
  userId: string,
  id: string,
  updates: Partial<Pick<Item, "name" | "category" | "defaultStore" | "defaultUnit" | "defaultQuantity">>
): Promise<Item | null> {
  const existing = await getItemById(userId, id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  db.update(schema.items)
    .set({
      name: updated.name,
      category: updated.category,
      defaultStore: updated.defaultStore,
      defaultUnit: updated.defaultUnit,
      defaultQuantity: updated.defaultQuantity,
    })
    .where(and(eq(schema.items.id, id), eq(schema.items.userId, userId)))
    .run();
  return updated;
}

export async function deleteItem(
  userId: string,
  id: string
): Promise<boolean> {
  const existing = await getItemById(userId, id);
  if (!existing) return false;
  db.delete(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, id),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  db.delete(schema.inventoryNotes)
    .where(
      and(
        eq(schema.inventoryNotes.itemId, id),
        eq(schema.inventoryNotes.userId, userId)
      )
    )
    .run();
  db.update(schema.items)
    .set({ deletedAt: new Date().toISOString() })
    .where(and(eq(schema.items.id, id), eq(schema.items.userId, userId)))
    .run();
  return true;
}

// --- List Entries ---

export async function getListEntries(userId: string): Promise<ListEntry[]> {
  return db
    .select()
    .from(schema.listEntries)
    .where(eq(schema.listEntries.userId, userId))
    .orderBy(asc(schema.listEntries.addedAt));
}

export async function addToList(
  userId: string,
  itemId: string
): Promise<ListEntry | null> {
  const item = await getItemById(userId, itemId);
  if (!item) return null;

  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();

  if (existing) {
    const updated = {
      ...existing,
      pickedUp: false,
      unavailable: false,
      quantity: item.defaultQuantity,
      addedAt: new Date().toISOString(),
    };
    db.update(schema.listEntries)
      .set({ pickedUp: false, unavailable: false, quantity: item.defaultQuantity, addedAt: updated.addedAt })
      .where(
        and(
          eq(schema.listEntries.itemId, itemId),
          eq(schema.listEntries.userId, userId)
        )
      )
      .run();
    return updated;
  }

  const entry = {
    itemId,
    userId,
    pickedUp: false,
    unavailable: false,
    storeOverride: null,
    quantity: item.defaultQuantity,
    addedAt: new Date().toISOString(),
  };
  db.insert(schema.listEntries).values(entry).run();
  return entry;
}

export async function setPickedUp(
  userId: string,
  itemId: string,
  pickedUp: boolean
): Promise<ListEntry | null> {
  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();
  if (!existing) return null;
  const updates = { pickedUp, ...(pickedUp ? { unavailable: false } : {}) };
  db.update(schema.listEntries)
    .set(updates)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  return { ...existing, ...updates };
}

export async function setUnavailable(
  userId: string,
  itemId: string,
  unavailable: boolean
): Promise<ListEntry | null> {
  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();
  if (!existing) return null;
  const updates = {
    unavailable,
    ...(unavailable ? { pickedUp: false } : {}),
  };
  db.update(schema.listEntries)
    .set(updates)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  return { ...existing, ...updates };
}

export async function setListEntryStore(
  userId: string,
  itemId: string,
  store: string | null
): Promise<ListEntry | null> {
  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();
  if (!existing) return null;
  db.update(schema.listEntries)
    .set({ storeOverride: store })
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  return { ...existing, storeOverride: store };
}

export async function setListEntryQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<ListEntry | null> {
  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();
  if (!existing) return null;
  db.update(schema.listEntries)
    .set({ quantity })
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  return { ...existing, quantity };
}

export async function removeFromList(
  userId: string,
  itemId: string
): Promise<boolean> {
  const existing = db
    .select()
    .from(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .get();
  if (!existing) return false;
  db.delete(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.itemId, itemId),
        eq(schema.listEntries.userId, userId)
      )
    )
    .run();
  return true;
}

export async function clearList(userId: string): Promise<boolean> {
  const entries = await getListEntries(userId);
  if (entries.length === 0) return false;
  db.delete(schema.listEntries)
    .where(eq(schema.listEntries.userId, userId))
    .run();
  return true;
}

// --- Inventory Notes ---

export async function getInventoryNotes(
  userId: string
): Promise<InventoryNote[]> {
  return db
    .select()
    .from(schema.inventoryNotes)
    .where(eq(schema.inventoryNotes.userId, userId))
    .orderBy(desc(schema.inventoryNotes.createdAt));
}

export async function getLatestInventoryByItem(
  userId: string
): Promise<Record<string, InventoryNote>> {
  const notes = await getInventoryNotes(userId);
  const byItem: Record<string, InventoryNote> = {};
  for (const n of notes) {
    if (!byItem[n.itemId]) byItem[n.itemId] = n;
  }
  return byItem;
}

export async function addInventoryNote(
  userId: string,
  itemId: string,
  note: string
): Promise<InventoryNote | null> {
  const item = await getItemById(userId, itemId);
  if (!item) return null;
  const inv = {
    id: randomId(),
    userId,
    itemId,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.inventoryNotes).values(inv).run();
  return inv;
}

// --- Combined queries ---

export async function getItemsOnList(
  userId: string
): Promise<(Item & ListEntry)[]> {
  const allItems = await getAllItems(userId);
  const entries = await getListEntries(userId);
  return entries
    .filter((e) => !e.pickedUp && !e.unavailable)
    .map((e) => {
      const item = allItems.find((i) => i.id === e.itemId);
      return item ? { ...item, ...e } : null;
    })
    .filter(Boolean) as (Item & ListEntry)[];
}

export async function getListWithPickedUp(
  userId: string
): Promise<(Item & ListEntry)[]> {
  const allItems = await getAllItems(userId);
  const entries = await getListEntries(userId);
  return entries
    .map((e) => {
      const item = allItems.find((i) => i.id === e.itemId);
      return item ? { ...item, ...e } : null;
    })
    .filter(Boolean) as (Item & ListEntry)[];
}
