export const THEME_STORAGE_KEY = "shopper-theme";

const VALID_THEMES = ["sprout", "blossom", "midnight", "forest"] as const;

export type ThemeId = (typeof VALID_THEMES)[number];

export const THEMES: { id: ThemeId; label: string; mode: "light" | "dark" }[] =
  [
    { id: "sprout", label: "Sprout", mode: "light" },
    { id: "blossom", label: "Blossom", mode: "light" },
    { id: "midnight", label: "Midnight", mode: "dark" },
    { id: "forest", label: "Forest", mode: "dark" },
  ];

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "sprout";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (VALID_THEMES.includes(stored as ThemeId)) return stored as ThemeId;
  return "sprout";
}

export function setStoredTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}
