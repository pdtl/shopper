export const THEME_STORAGE_KEY = "shopper-theme";

const VALID_THEMES = [
  "default",
  "bright",
  "mint",
  "sky",
  "lavender",
  "sunny",
  "snow",
] as const;

export type ThemeId = (typeof VALID_THEMES)[number];

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "default", label: "Warm" },
  { id: "bright", label: "Bright" },
  { id: "mint", label: "Mint" },
  { id: "sky", label: "Sky" },
  { id: "lavender", label: "Lavender" },
  { id: "sunny", label: "Sunny" },
  { id: "snow", label: "Snow" },
];

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (VALID_THEMES.includes(stored as ThemeId)) return stored as ThemeId;
  return "default";
}

export function setStoredTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}
