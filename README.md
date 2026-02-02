# Shopper

A mobile-optimized web app for managing a household shopping list. Add items, set categories and default stores, track inventory, and check things off as you shop.

## Features

- **Home** – Friendly landing; auth is auto-approved when run locally.
- **Shopping list** – View list and check off items as you pick them up; filter by category (pills) or store (dropdown).
- **Items** – Browse all items and see the latest inventory notes.
- **Manage item** – Edit category, default store, and add inventory notes; add/remove from list.

## Running locally

Requires **Node.js 18+** (Next.js 14 requirement).

1. Install dependencies: `npm install`
2. (Optional) Create `.env.local` and set `SHOPPER_API_KEY=your-key` for API access. Default is `dev-key-local-only`.
3. Run the dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

Data is stored in `data/db.json` (created on first write).

## Authentication

- Every page requires authentication. For local use, auth is **auto-approved** (no login screen).
- To require real login later, set `AUTO_APPROVE_AUTH` to `false` in `src/lib/auth.ts` and implement your auth flow.

## API

All updates are available as REST API actions for integration with other tools.

- **Documentation**: Visit `/docs` in the app or `GET /api/docs` (JSON).
- **Authentication**: Send `x-api-key: <your-key>` on every request. The key is set via `SHOPPER_API_KEY` (default: `dev-key-local-only`).

See the in-app **API** page or the `/api/docs` response for full endpoint list and types.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- File-based JSON store (no database required for local use)
