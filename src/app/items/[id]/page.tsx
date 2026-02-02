import { notFound } from "next/navigation";
import { getItemAction, getInventoryNotesForItemAction } from "@/app/actions";
import { ItemManage } from "@/components/ItemManage";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, notes] = await Promise.all([
    getItemAction(id),
    getInventoryNotesForItemAction(id),
  ]);
  if (!item) notFound();
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <ItemManage item={item} initialNotes={notes} />
    </div>
  );
}
