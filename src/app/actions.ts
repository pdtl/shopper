"use server";

import { revalidatePath } from "next/cache";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getListWithPickedUp,
  addToList,
  removeFromList,
  clearList,
  setPickedUp,
  getInventoryNotes,
  getLatestInventoryByItem,
  addInventoryNote,
} from "@/lib/db";

export async function getItemsAction() {
  return getAllItems();
}

export async function getItemAction(id: string) {
  return getItemById(id);
}

export async function createItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  const category = (formData.get("category") as string) || null;
  const defaultStore = (formData.get("defaultStore") as string) || null;
  if (!name?.trim()) return { error: "Name is required" };
  const item = await createItem({ name: name.trim(), category, defaultStore });
  revalidatePath("/items");
  return { item };
}

export async function updateItemAction(
  id: string,
  formData: FormData
) {
  const name = formData.get("name") as string | undefined;
  const category = (formData.get("category") as string) || null;
  const defaultStore = (formData.get("defaultStore") as string) || null;
  const item = await updateItem(id, {
    ...(name !== undefined && { name: name.trim() }),
    category,
    defaultStore,
  });
  if (!item) return { error: "Item not found" };
  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/list");
  return { item };
}

export async function deleteItemAction(id: string) {
  const ok = await deleteItem(id);
  revalidatePath("/items");
  revalidatePath("/list");
  return { ok };
}

export async function getListAction() {
  return getListWithPickedUp();
}

export async function addToListAction(itemId: string) {
  const entry = await addToList(itemId);
  revalidatePath("/list");
  revalidatePath("/items");
  return { entry };
}

export async function removeFromListAction(itemId: string) {
  const ok = await removeFromList(itemId);
  revalidatePath("/list");
  revalidatePath("/items");
  return { ok };
}

export async function clearListAction() {
  const ok = await clearList();
  revalidatePath("/list");
  revalidatePath("/items");
  return { ok };
}

export async function setPickedUpAction(itemId: string, pickedUp: boolean) {
  const entry = await setPickedUp(itemId, pickedUp);
  if (entry) revalidatePath("/list");
  return { entry };
}

export async function getInventoryByItemAction() {
  return getLatestInventoryByItem();
}

export async function addInventoryNoteAction(itemId: string, note: string) {
  if (!note?.trim()) return { error: "Note is required" };
  const inv = await addInventoryNote(itemId, note.trim());
  if (!inv) return { error: "Item not found" };
  revalidatePath(`/items/${itemId}`);
  return { note: inv };
}

export async function getInventoryNotesForItemAction(itemId: string) {
  const all = await getInventoryNotes();
  return all.filter((n) => n.itemId === itemId);
}
