"use client";

import { useState } from "react";

type FeedbackType = "bug" | "feature" | "comment";

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "comment", label: "Comment" },
];

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!message.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div
        className="bg-[var(--card)] rounded-2xl shadow-lg p-6 w-full max-w-md border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="feedback-title"
          className="text-lg font-semibold text-[var(--foreground)] mb-4"
        >
          Send Feedback
        </h2>

        {status === "success" ? (
          <div className="text-center py-4">
            <p className="text-[var(--foreground)] font-medium mb-1">Thanks for your feedback!</p>
            <p className="text-sm text-[var(--muted)] mb-4">A GitHub issue has been created.</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--foreground)] hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Type selector pills */}
            <div className="flex gap-2 mb-4">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    type === opt.value
                      ? "bg-[var(--accent)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Message textarea */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue or suggestion..."
              rows={4}
              maxLength={5000}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-4"
            />

            {status === "error" && (
              <p className="text-sm text-red-500 mb-3">{errorMsg}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || status === "loading"}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
