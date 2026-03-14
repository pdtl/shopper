"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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
  setUnavailable,
  setListEntryStore,
  setListEntryQuantity,
  getInventoryNotes,
  getLatestInventoryByItem,
  addInventoryNote,
} from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

async function getSessionUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("shopper_session")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Invalid session");
  return user.id;
}

export async function getItemsAction() {
  const userId = await getSessionUserId();
  return getAllItems(userId);
}

export async function getItemAction(id: string) {
  const userId = await getSessionUserId();
  return getItemById(userId, id);
}

export async function createItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  const category = ((formData.get("category") as string) || "").trim() || null;
  const defaultStore =
    ((formData.get("defaultStore") as string) || "").trim() || null;
  const defaultUnit = ((formData.get("defaultUnit") as string) || "").trim() || "packet";
  const defaultQuantity = Math.max(1, parseInt((formData.get("defaultQuantity") as string) || "1", 10) || 1);
  if (!name?.trim()) return { error: "Name is required" };
  const userId = await getSessionUserId();
  const item = await createItem(userId, {
    name: name.trim(),
    category,
    defaultStore,
    defaultUnit,
    defaultQuantity,
  });
  revalidatePath("/items");
  return { item };
}

export async function updateItemAction(id: string, formData: FormData) {
  const name = formData.get("name") as string | undefined;
  const category = ((formData.get("category") as string) || "").trim() || null;
  const defaultStore =
    ((formData.get("defaultStore") as string) || "").trim() || null;
  const defaultUnit = ((formData.get("defaultUnit") as string) || "").trim() || "packet";
  const defaultQuantity = Math.max(1, parseInt((formData.get("defaultQuantity") as string) || "1", 10) || 1);
  const userId = await getSessionUserId();
  const item = await updateItem(userId, id, {
    ...(name !== undefined && { name: name.trim() }),
    category,
    defaultStore,
    defaultUnit,
    defaultQuantity,
  });
  if (!item) return { error: "Item not found" };
  revalidatePath("/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/list");
  return { item };
}

export async function deleteItemAction(id: string) {
  const userId = await getSessionUserId();
  const ok = await deleteItem(userId, id);
  revalidatePath("/items");
  revalidatePath("/list");
  return { ok };
}

export async function getListAction() {
  const userId = await getSessionUserId();
  return getListWithPickedUp(userId);
}

export async function addToListAction(itemId: string) {
  const userId = await getSessionUserId();
  const entry = await addToList(userId, itemId);
  revalidatePath("/list");
  revalidatePath("/items");
  return { entry };
}

export async function removeFromListAction(itemId: string) {
  const userId = await getSessionUserId();
  const ok = await removeFromList(userId, itemId);
  revalidatePath("/list");
  revalidatePath("/items");
  return { ok };
}

export async function clearListAction() {
  const userId = await getSessionUserId();
  const ok = await clearList(userId);
  revalidatePath("/list");
  revalidatePath("/items");
  return { ok };
}

export async function setPickedUpAction(itemId: string, pickedUp: boolean) {
  const userId = await getSessionUserId();
  const entry = await setPickedUp(userId, itemId, pickedUp);
  if (entry) revalidatePath("/list");
  return { entry };
}

export async function setUnavailableAction(
  itemId: string,
  unavailable: boolean
) {
  const userId = await getSessionUserId();
  const entry = await setUnavailable(userId, itemId, unavailable);
  if (entry) revalidatePath("/list");
  return { entry };
}

export async function setListEntryQuantityAction(
  itemId: string,
  quantity: number
) {
  const userId = await getSessionUserId();
  const entry = await setListEntryQuantity(userId, itemId, Math.min(99, Math.max(1, quantity)));
  if (entry) revalidatePath("/list");
  return { entry };
}

export async function setListEntryStoreAction(
  itemId: string,
  store: string | null
) {
  const userId = await getSessionUserId();
  const entry = await setListEntryStore(userId, itemId, store?.trim() || null);
  if (entry) revalidatePath("/list");
  return { entry };
}

export async function getInventoryByItemAction() {
  const userId = await getSessionUserId();
  return getLatestInventoryByItem(userId);
}

export async function addInventoryNoteAction(itemId: string, note: string) {
  if (!note?.trim()) return { error: "Note is required" };
  const userId = await getSessionUserId();
  const inv = await addInventoryNote(userId, itemId, note.trim());
  if (!inv) return { error: "Item not found" };
  revalidatePath(`/items/${itemId}`);
  return { note: inv };
}

export async function getInventoryNotesForItemAction(itemId: string) {
  const userId = await getSessionUserId();
  const all = await getInventoryNotes(userId);
  return all.filter((n) => n.itemId === itemId);
}
