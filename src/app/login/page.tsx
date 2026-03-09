"use client";

import { useState } from "react";
import { loginAction, signupAction } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result =
      mode === "login"
        ? await loginAction(formData)
        : await signupAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="text-[var(--muted)] mb-6 text-sm">
        {mode === "login"
          ? "Welcome back."
          : "Create your account to get started."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-4"
      >
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[var(--muted)] mb-1"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--muted)] mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-[var(--muted)] mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[var(--foreground)] disabled:opacity-50"
        >
          {loading
            ? mode === "login"
              ? "Signing in…"
              : "Creating account…"
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>

      <p className="text-sm text-center text-[var(--muted)] mt-4">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className="text-[var(--foreground)] underline"
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className="text-[var(--foreground)] underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
