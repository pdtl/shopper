import Link from "next/link";
import { apiDocs } from "@/lib/api-docs";

const BASE = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default function DocsPage() {
  const baseUrl = `${BASE}/api`;
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link
        href="/"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4 inline-block"
      >
        ← Home
      </Link>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {apiDocs.title}
      </h1>
      <p className="text-[var(--muted)] mb-6">{apiDocs.description}</p>
      <p className="text-sm text-[var(--muted)] mb-6">
        Base URL: <code className="bg-[var(--border)] px-1 rounded">{baseUrl}</code>
      </p>
      <p className="text-sm text-[var(--foreground)] mb-4">
        Send <code className="bg-[var(--border)] px-1 rounded">x-api-key: &lt;your-key&gt;</code> on every request. For local dev, set <code className="bg-[var(--border)] px-1 rounded">SHOPPER_API_KEY</code> in <code className="bg-[var(--border)] px-1 rounded">.env.local</code> (default: <code className="bg-[var(--border)] px-1 rounded">dev-key-local-only</code>).
      </p>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-6">
        {apiDocs.endpoints.map((ep) => (
          <li
            key={`${ep.method} ${ep.path}`}
            className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
          >
            <div className="flex gap-2 items-center mb-2">
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  ep.method === "GET"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : ep.method === "POST"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : ep.method === "PATCH"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm text-[var(--foreground)]">{ep.path}</code>
            </div>
            <p className="text-sm text-[var(--muted)] mb-2">{ep.description}</p>
            {"body" in ep && ep.body && (
              <p className="text-xs text-[var(--muted)]">
                Body: <code>{JSON.stringify(ep.body)}</code>
              </p>
            )}
            {"response" in ep && ep.response && (
              <p className="text-xs text-[var(--muted)]">
                Response: <code>{JSON.stringify(ep.response)}</code>
              </p>
            )}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mt-8 mb-4">
        Types
      </h2>
      <pre className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 text-sm overflow-x-auto">
        {JSON.stringify(apiDocs.types, null, 2)}
      </pre>
    </div>
  );
}
