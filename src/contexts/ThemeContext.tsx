"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme, ThemeName, themes, defaultTheme } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const theme = themes[themeName];
    if (!theme) return;

    // Apply theme to CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Keep camelCase for CSS variables to match globals.css
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set unified game variables to use the same colors as the rest of the site
    root.style.setProperty("--game-bg", theme.colors.background);
    root.style.setProperty("--game-surface", theme.colors.surface);
    root.style.setProperty("--game-border", theme.colors.border);
    root.style.setProperty("--game-text-primary", theme.colors.textPrimary);
    root.style.setProperty("--game-text-secondary", theme.colors.textSecondary);
    root.style.setProperty("--game-accent", theme.colors.primary);
    root.style.setProperty("--game-strike", theme.colors.accent);
    root.style.setProperty("--game-spare", theme.colors.success);
    root.style.setProperty("--game-miss", theme.colors.error);

    // Calculate and set game accent dim (20% opacity of primary)
    const primaryColor = theme.colors.primary;
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      root.style.setProperty(
        "--game-accent-dim",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
      );
    }

    // Save to localStorage
    localStorage.setItem("theme", themeName);
  }, [themeName, mounted]);

  // Helper function to convert hex to RGB
  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  const setTheme = (name: ThemeName) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  // Use current theme or default during SSR
  const theme = themes[themeName] || themes[defaultTheme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName: mounted ? themeName : defaultTheme,
        setTheme,
        availableThemes: Object.values(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

