# Shopper

A mobile-optimized web app for managing a household shopping list. Add items, set categories and default stores, track inventory, and check things off as you shop. Supports multiple users, each with fully isolated data.

## Features

- **Home** – Friendly landing page.
- **Shopping list** – Check off items as you pick them up, or mark them unavailable. Filter by category (pills), store (dropdown), or search by name. Compact view toggle. Progress bar showing picked/unavailable counts. Per-trip store override. Clear list action.
- **Items** – Browse all items grouped by category (alphabetical), sorted by name within each group. Filter by category or store, or search by name. Add new items directly to the shopping list in one step.
- **Manage item** – Edit name, category, and default store; add inventory notes; add/remove from list; delete item.
- **Feedback** – Submit bug reports, feature requests, or comments via the nav (creates a GitHub issue).
- **Themes** – Choose **Sprout** or **Blossom** (light) or **Midnight** or **Forest** (dark) from the nav. Choice is saved in localStorage.

## Running locally

Requires **Node.js 18+** (Next.js 14 requirement).

1. Install dependencies: `npm install`
2. (Optional) Create `.env.local` and set `SHOPPER_API_KEY=your-key` for API access. Default is `dev-key-local-only`.
3. Run the dev server: `npm run dev`
4. Open [http://localhost:3001](http://localhost:3001)

Data is stored in `data/db.sqlite` (created automatically on first run).

## Authentication

By default, auth is **auto-approved** for local use — no login required. A `dev` user is created automatically.

To require real login (e.g. for multi-user or hosted deployments):

1. Set `AUTO_APPROVE_AUTH=false` in your environment (e.g. in `.env.local`)
2. Visit the app — you'll be redirected to `/login`
3. Create an account on first run; subsequent users can sign up from the same page

Each user has fully isolated items, shopping list, and inventory notes.

## API

All updates are available as REST API actions for integration with other tools.

- **Documentation**: Visit `/docs` in the app or `GET /api/docs` (JSON).
- **Authentication**: Send `x-api-key: <your-key>` on every request.
  - In dev mode (auto-approve), the key is `dev-key-local-only` (or `SHOPPER_API_KEY` env var).
  - In multi-user mode, each user has their own API key stored in the database.

See the in-app **API** page or the `/api/docs` response for full endpoint list and types.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- SQLite via Drizzle ORM (`data/db.sqlite`)
