// Accent color options - these work with both light and dark modes
export const accentColors = {
  blue: {
    name: "blue",
    displayName: "Blue",
    light: "#2563eb", // blue-600
    dark: "#3b82f6",  // blue-500
  },
  green: {
    name: "green",
    displayName: "Green",
    light: "#1a5f3f", // custom dark green
    dark: "#22c55e",  // green-500
  },
  purple: {
    name: "purple",
    displayName: "Purple",
    light: "#7c3aed", // violet-600
    dark: "#a78bfa",  // violet-400
  },
  orange: {
    name: "orange",
    displayName: "Orange",
    light: "#f97316", // orange-500
    dark: "#fb923c",  // orange-400
  },
} as const;

export type AccentColorName = keyof typeof accentColors;

export const defaultAccentColor: AccentColorName = "blue";

// Theme mode
export type ThemeMode = "light" | "dark";

export const defaultThemeMode: ThemeMode = "light";
