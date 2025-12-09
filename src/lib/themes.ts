export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    error: string;
    border: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    name: "default",
    displayName: "Billiard Green",
    colors: {
      primary: "#1a5f3f",
      accent: "#f59e0b",
      background: "#f9fafb",
      surface: "#ffffff",
      textPrimary: "#1f2937",
      textSecondary: "#6b7280",
      success: "#10b981",
      error: "#ef4444",
      border: "#e5e7eb",
    },
  },
  blue: {
    name: "blue",
    displayName: "Ocean Blue",
    colors: {
      primary: "#2563eb",
      accent: "#f59e0b",
      background: "#f9fafb",
      surface: "#ffffff",
      textPrimary: "#1f2937",
      textSecondary: "#6b7280",
      success: "#10b981",
      error: "#ef4444",
      border: "#e5e7eb",
    },
  },
  dark: {
    name: "dark",
    displayName: "Dark Mode",
    colors: {
      primary: "#22c55e",
      accent: "#f59e0b",
      background: "#0a0a0a",
      surface: "#18181b",
      textPrimary: "#f4f4f5",
      textSecondary: "#a1a1aa",
      success: "#10b981",
      error: "#ef4444",
      border: "#27272a",
    },
  },
};

export type ThemeName = keyof typeof themes;

export const defaultTheme: ThemeName = "default";

