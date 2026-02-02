import { getItemsAction, getInventoryByItemAction, getListAction } from "@/app/actions";
import { ItemGrid } from "@/components/ItemGrid";

export default async function ItemsPage() {
  const [items, inventoryByItem, list] = await Promise.all([
    getItemsAction(),
    getInventoryByItemAction(),
    getListAction(),
  ]);
  const itemIdsOnList = list.map((e) => e.itemId);
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
        All items
      </h1>
      <p className="text-[var(--muted)] mb-6">
        Browse items and see the latest inventory notes. Tap to manage category and inventory.
      </p>
      <ItemGrid items={items} inventoryByItem={inventoryByItem} itemIdsOnList={itemIdsOnList} />
    </div>
  );
}
