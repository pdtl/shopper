import { getListAction } from "@/app/actions";
import { ListView } from "@/components/ListView";

export default async function ListPage() {
  const list = await getListAction();
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
        Shopping list
      </h1>
      <p className="text-[var(--muted)] mb-6">
        Check off items as you pick them up.
      </p>
      <ListView initialList={list} />
    </div>
  );
}
