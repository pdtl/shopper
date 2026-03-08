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
        Use this page to add items to your shopping list or update your current inventory.
      </p>
      <ItemGrid items={items} inventoryByItem={inventoryByItem} itemIdsOnList={itemIdsOnList} />
    </div>
  );
}
