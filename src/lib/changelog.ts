export interface Release {
  version: string;
  date: string;
  summary: string;
  changes: string[];
  major?: boolean;
}

export const RELEASES: Release[] = [
  {
    version: "1.1",
    date: "2026-03-09",
    summary: "Soft delete for items",
    changes: [
      "Deleted items are now soft-deleted in the database instead of being permanently removed",
    ],
  },
  {
    version: "1.0",
    date: "2025-01-01",
    summary: "SQLite, Drizzle ORM, and multi-user support",
    major: true,
    changes: [
      "Migrated from in-memory storage to a persistent SQLite database",
      "Added Drizzle ORM for type-safe database queries",
      "Multi-user support with fully isolated data per user",
      "Session-based authentication with cookie sessions",
      "API key authentication for the REST API",
      "Auto-approve dev mode for local development (no login required)",
    ],
  },
  {
    version: "0.5",
    date: "2024-12-01",
    summary: "Items page overhaul",
    changes: [
      "Group items by category with collapsible section headings",
      "Unified compact row display across List and Items pages",
      "Find-or-create field: type to find an existing item or create a new one",
      "Pill-style store filter on the Items page",
      "Improved new item flow with Save and Add to List options",
      "Delete item from the item edit page",
      "Consolidated item edit actions into a single card",
      "Save on edit page navigates back; add/remove list are separate actions",
    ],
  },
  {
    version: "0.4",
    date: "2024-11-01",
    summary: "Theme overhaul",
    changes: [
      "Replaced the original theme system with 4 Material Design 3-inspired themes",
      "Themes: Sprout (light), Blossom (light), Midnight (dark), Forest (dark)",
      "Theme selection persisted in localStorage with no flash on load",
    ],
  },
  {
    version: "0.3",
    date: "2024-10-01",
    summary: "Search, unavailable status, store overrides, and more",
    changes: [
      "Type-to-filter search on the List and Items pages",
      "Mark items as unavailable (shown separately from picked-up)",
      "Per-trip store override: choose a different store for an item on the list",
      "Progress bar filters by active store and category selection",
      "Compact view toggle on the shopping list",
      "Feedback button with responsive nav and hamburger menu for mobile",
      "Docker support for containerized deployment",
    ],
  },
  {
    version: "0.2",
    date: "2024-09-01",
    summary: "List page filters and progress tracking",
    changes: [
      "Category and store filter pills on the shopping list",
      "Progress bar showing picked-up items out of total",
      "Clear List button with confirmation",
      "On List / Not on List indicator on item cards",
      "Filter pills are single-select per category",
      "Progress bar respects active store and category filters",
    ],
  },
  {
    version: "0.1",
    date: "2024-08-01",
    summary: "Initial release",
    changes: [
      "Shopping list with check-off and picked-up tracking",
      "Items catalog with name, category, and preferred store",
      "Inventory notes per item",
      "REST API for external integrations",
    ],
  },
];

export const CURRENT_VERSION = RELEASES[0].version;
