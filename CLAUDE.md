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

**Shopper** is a Next.js 14 App Router shopping list app with TypeScript, Tailwind CSS, and a file-based JSON database.

### Data Layer

- **Database**: `src/lib/db.ts` — reads/writes `data/db.json` (auto-created, gitignored). Three collections: `items`, `listEntries`, `inventoryNotes`.
- **Server Actions**: `src/app/actions.ts` — async functions called from Server Components and Client Components for all data mutations. Uses `revalidatePath()` for cache invalidation.
- **API Routes**: `src/app/api/` — REST endpoints for external integrations. Protected by `x-api-key` header (default: `dev-key-local-only`, configurable via `SHOPPER_API_KEY` env var). Auth logic in `src/lib/api-auth.ts`.

### Pages & Components

- Pages are **Server Components** by default — they fetch data via Server Actions and pass it to Client Components.
- Interactive components in `src/components/` are marked `"use client"` and handle local state, forms, and optimistic UI updates.
- Client components refetch on mount via `useEffect()` to avoid stale Next.js router cache.

### Auth

- Cookie-based sessions via middleware (`src/middleware.ts`). `AUTO_APPROVE_AUTH = true` for local dev.
- API routes use separate API key auth.

### Theme System

- 7 color themes defined as CSS custom properties in `src/app/globals.css` with light/dark mode support.
- Tailwind maps semantic color names (`background`, `foreground`, `card`, `accent`, `muted`, `border`, `success`) to CSS variables in `tailwind.config.ts`.
- Theme persisted in localStorage, applied via inline script in `layout.tsx` to prevent flash.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Docker

Multi-stage Dockerfile using `node:20-alpine`. Uses Next.js standalone output mode. Runs on port 3001.
