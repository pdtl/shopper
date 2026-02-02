export interface Item {
  id: string;
  name: string;
  category: string | null;
  defaultStore: string | null;
  createdAt: string;
}

export interface ListEntry {
  itemId: string;
  pickedUp: boolean;
  addedAt: string;
}

export interface InventoryNote {
  id: string;
  itemId: string;
  note: string;
  createdAt: string;
}

export interface DbSchema {
  items: Item[];
  listEntries: ListEntry[];
  inventoryNotes: InventoryNote[];
}
