import { RELEASES } from "@/lib/changelog";

export default function ChangelogPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Changelog</h1>
      <p className="text-sm text-[var(--muted)] mb-8">What&apos;s changed in Shopper</p>

      <div className="space-y-8">
        {RELEASES.map((release) => (
          <div key={release.version}>
            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-lg font-bold ${release.major ? "text-[var(--accent-foreground,var(--foreground))]" : "text-[var(--foreground)]"}`}>
                v{release.version}
              </span>
              {release.major && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--foreground)]">
                  Major
                </span>
              )}
              <span className="text-xs text-[var(--muted)] ml-auto">{release.date}</span>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">{release.summary}</p>
            <ul className="space-y-1">
              {release.changes.map((change, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--muted)]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--border)]" />
                  {change}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-b border-[var(--border)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
