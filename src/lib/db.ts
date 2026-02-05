import { promises as fs } from "fs";
import path from "path";
import type { DbSchema, Item, ListEntry, InventoryNote } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function randomId(): string {
  return Math.random().toString(36).slice(2, 11);
}

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readDb(): Promise<DbSchema> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as DbSchema;
  } catch {
    return { items: [], listEntries: [], inventoryNotes: [] };
  }
}

async function writeDb(db: DbSchema): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function getAllItems(): Promise<Item[]> {
  const db = await readDb();
  return db.items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getItemById(id: string): Promise<Item | null> {
  const db = await readDb();
  return db.items.find((i) => i.id === id) ?? null;
}

export async function createItem(input: {
  name: string;
  category?: string | null;
  defaultStore?: string | null;
}): Promise<Item> {
  const db = await readDb();
  const item: Item = {
    id: randomId(),
    name: input.name.trim(),
    category: input.category?.trim() || null,
    defaultStore: input.defaultStore?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  db.items.push(item);
  await writeDb(db);
  return item;
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<Item, "name" | "category" | "defaultStore">>
): Promise<Item | null> {
  const db = await readDb();
  const idx = db.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  db.items[idx] = { ...db.items[idx], ...updates };
  await writeDb(db);
  return db.items[idx];
}

export async function deleteItem(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.items.length;
  db.items = db.items.filter((i) => i.id !== id);
  db.listEntries = db.listEntries.filter((e) => e.itemId !== id);
  db.inventoryNotes = db.inventoryNotes.filter((n) => n.itemId !== id);
  if (db.items.length === before) return false;
  await writeDb(db);
  return true;
}

export async function getListEntries(): Promise<ListEntry[]> {
  const db = await readDb();
  return db.listEntries.sort(
    (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
  );
}

export async function addToList(itemId: string): Promise<ListEntry | null> {
  const db = await readDb();
  if (!db.items.some((i) => i.id === itemId)) return null;
  const existing = db.listEntries.find((e) => e.itemId === itemId);
  if (existing) {
    existing.pickedUp = false;
    existing.addedAt = new Date().toISOString();
    await writeDb(db);
    return existing;
  }
  const entry: ListEntry = {
    itemId,
    pickedUp: false,
    addedAt: new Date().toISOString(),
  };
  db.listEntries.push(entry);
  await writeDb(db);
  return entry;
}

export async function setPickedUp(
  itemId: string,
  pickedUp: boolean
): Promise<ListEntry | null> {
  const db = await readDb();
  const entry = db.listEntries.find((e) => e.itemId === itemId);
  if (!entry) return null;
  entry.pickedUp = pickedUp;
  await writeDb(db);
  return entry;
}

export async function removeFromList(itemId: string): Promise<boolean> {
  const db = await readDb();
  const before = db.listEntries.length;
  db.listEntries = db.listEntries.filter((e) => e.itemId !== itemId);
  if (db.listEntries.length === before) return false;
  await writeDb(db);
  return true;
}

export async function clearList(): Promise<boolean> {
  const db = await readDb();
  if (db.listEntries.length === 0) return false;
  db.listEntries = [];
  await writeDb(db);
  return true;
}

export async function getInventoryNotes(): Promise<InventoryNote[]> {
  const db = await readDb();
  return db.inventoryNotes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getLatestInventoryByItem(): Promise<
  Record<string, InventoryNote>
> {
  const notes = await getInventoryNotes();
  const byItem: Record<string, InventoryNote> = {};
  for (const n of notes) {
    if (!byItem[n.itemId]) byItem[n.itemId] = n;
  }
  return byItem;
}

export async function addInventoryNote(
  itemId: string,
  note: string
): Promise<InventoryNote | null> {
  const db = await readDb();
  if (!db.items.some((i) => i.id === itemId)) return null;
  const inv: InventoryNote = {
    id: randomId(),
    itemId,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  };
  db.inventoryNotes.push(inv);
  await writeDb(db);
  return inv;
}

export async function getItemsOnList(): Promise<(Item & ListEntry)[]> {
  const db = await readDb();
  const items = db.items;
  const entries = db.listEntries.filter((e) => !e.pickedUp);
  return entries
    .map((e) => {
      const item = items.find((i) => i.id === e.itemId);
      return item ? { ...item, ...e } : null;
    })
    .filter(Boolean) as (Item & ListEntry)[];
}

export async function getListWithPickedUp(): Promise<(Item & ListEntry)[]> {
  const db = await readDb();
  const items = db.items;
  return db.listEntries
    .map((e) => {
      const item = items.find((i) => i.id === e.itemId);
      return item ? { ...item, ...e } : null;
    })
    .filter(Boolean) as (Item & ListEntry)[];
}
