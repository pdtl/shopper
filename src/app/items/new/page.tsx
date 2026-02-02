import { CreateItemForm } from "@/components/CreateItemForm";

export default function NewItemPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
        Add item
      </h1>
      <p className="text-[var(--muted)] mb-6">
        Create a new item. You can set category and default store here or later.
      </p>
      <CreateItemForm />
    </div>
  );
}
