import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Welcome to Shopper
        </h1>
        <p className="text-[var(--muted)] text-lg">
          Your friendly household shopping list. Add items, track inventory, and check things off as you go.
        </p>
      </div>
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
        <p className="text-[var(--foreground)] mb-6">
          You&apos;re signed in (local mode). Jump in and start managing your list.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/list"
            className="tap-target flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--accent)] text-[var(--foreground)] font-semibold no-underline hover:opacity-90 transition-opacity"
          >
            View shopping list
          </Link>
          <Link
            href="/items"
            className="tap-target flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-[var(--border)] text-[var(--foreground)] font-medium no-underline hover:bg-[var(--border)] transition-colors"
          >
            Browse all items
          </Link>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        <Link href="/docs" className="underline hover:no-underline">
          API docs
        </Link> for integrating with other tools
      </p>
    </div>
  );
}
