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
  light: {
    name: "light",
    displayName: "Light",
    colors: {
      primary: "#2563eb",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      success: "#10b981",
      error: "#ef4444",
      border: "#e2e8f0",
    },
  },
  dark: {
    name: "dark",
    displayName: "Dark",
    colors: {
      primary: "#3b82f6",
      accent: "#f59e0b",
      background: "#0f172a",
      surface: "#1e293b",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8",
      success: "#10b981",
      error: "#ef4444",
      border: "#334155",
    },
  },
  lightGreen: {
    name: "lightGreen",
    displayName: "Light - Green",
    colors: {
      primary: "#1a5f3f",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      success: "#10b981",
      error: "#ef4444",
      border: "#e2e8f0",
    },
  },
  lightPurple: {
    name: "lightPurple",
    displayName: "Light - Purple",
    colors: {
      primary: "#7c3aed",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      success: "#10b981",
      error: "#ef4444",
      border: "#e2e8f0",
    },
  },
  lightOrange: {
    name: "lightOrange",
    displayName: "Light - Orange",
    colors: {
      primary: "#f97316",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      success: "#10b981",
      error: "#ef4444",
      border: "#e2e8f0",
    },
  },
  darkGreen: {
    name: "darkGreen",
    displayName: "Dark - Green",
    colors: {
      primary: "#22c55e",
      accent: "#f59e0b",
      background: "#0f172a",
      surface: "#1e293b",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8",
      success: "#10b981",
      error: "#ef4444",
      border: "#334155",
    },
  },
  darkPurple: {
    name: "darkPurple",
    displayName: "Dark - Purple",
    colors: {
      primary: "#a78bfa",
      accent: "#f59e0b",
      background: "#0f172a",
      surface: "#1e293b",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8",
      success: "#10b981",
      error: "#ef4444",
      border: "#334155",
    },
  },
  darkOrange: {
    name: "darkOrange",
    displayName: "Dark - Orange",
    colors: {
      primary: "#fb923c",
      accent: "#f59e0b",
      background: "#0f172a",
      surface: "#1e293b",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8",
      success: "#10b981",
      error: "#ef4444",
      border: "#334155",
    },
  },
};

export type ThemeName = keyof typeof themes;

export const defaultTheme: ThemeName = "light";

