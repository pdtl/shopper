import { getListAction } from "@/app/actions";
import { ListView } from "@/components/ListView";

export default async function ListPage() {
  const list = await getListAction();
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <ListView initialList={list} />
    </div>
  );
}
