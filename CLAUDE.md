# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on http://localhost:3001
npm run build        # Production build (standalone output)
npm start            # Production server on port 3001
npm run lint         # ESLint
```

No test framework is configured.

## Architecture

**Shopper** is a Next.js 14 App Router shopping list app with TypeScript, Tailwind CSS, and a SQLite database. It supports multiple users, each with isolated data.

### Data Layer

- **Database**: `src/lib/db.ts` — all queries via Drizzle ORM against `data/db.sqlite` (auto-created, gitignored). All exported functions take `userId: string` as the first parameter.
- **Schema**: `src/lib/schema.ts` — Drizzle table definitions: `users`, `sessions`, `items`, `listEntries`, `inventoryNotes`. Tables are created with `CREATE TABLE IF NOT EXISTS` on startup. New columns are added via `try/catch ALTER TABLE` migrations at the bottom of the `sqlite.exec()` block in `db.ts`.
- **Server Actions**: `src/app/actions.ts` — async functions called from Server Components and Client Components for all data mutations. Uses `revalidatePath()` for cache invalidation. Resolves `userId` via `getSessionUserId()` (reads session cookie, looks up user in DB).
- **API Routes**: `src/app/api/` — REST endpoints for external integrations. Protected by per-user API key via `requireApiKeyUser()` in `src/lib/api-auth.ts`.

### Pages & Components

- Pages are **Server Components** by default — they fetch data via Server Actions and pass it to Client Components.
- Interactive components in `src/components/` are marked `"use client"` and handle local state, forms, and optimistic UI updates.
- Client components refetch on mount via `useEffect()` to avoid stale Next.js router cache.

### Auth

- **Web sessions**: Cookie-based (`shopper_session`). Middleware (`src/middleware.ts`) stays thin — only checks cookie presence and redirects to `/login` if missing. No DB calls in middleware (Edge Runtime incompatible with better-sqlite3).
- **Session resolution**: `getSessionUser(token)` in `src/lib/auth.ts` looks up the session in SQLite and returns the user.
- **Auto-approve mode** (default): Set by `AUTO_APPROVE_AUTH` env var (true unless `AUTO_APPROVE_AUTH=false`). A `dev` user is auto-created; all requests use it. No login required.
- **Real login**: Set `AUTO_APPROVE_AUTH=false`. Users sign up/log in at `/login`. Login/signup actions in `src/app/login/actions.ts`.
- **API key auth**: Each user has a unique `apiKey` column. `requireApiKeyUser()` returns `{ userId }` or `{ error }`. In auto-approve mode, any request using the env API key resolves to the dev user.

### Theme System

- 4 color themes defined as CSS custom properties in `src/app/globals.css`: `sprout` (light), `blossom` (light), `midnight` (dark), `forest` (dark).
- Theme IDs and metadata in `src/lib/theme.ts`. Tailwind maps semantic color names (`background`, `foreground`, `card`, `accent`, `muted`, `border`, `success`, `unavailable`) to CSS variables in `tailwind.config.ts`.
- Theme persisted in localStorage, applied via inline script in `layout.tsx` to prevent flash. Themes do not follow system light/dark preference — selection is explicit.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Docker

Multi-stage Dockerfile using `node:20-alpine`. Uses Next.js standalone output mode. Runs on port 3001.
