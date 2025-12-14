"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ThemeMode,
  AccentColorName,
  accentColors,
  defaultThemeMode,
  defaultAccentColor,
} from "@/lib/themes";

interface ThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColorName;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (accent: AccentColorName) => void;
  availableAccentColors: typeof accentColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get initial theme from localStorage (safe for SSR)
function getInitialTheme(): { mode: ThemeMode; accent: AccentColorName } {
  if (typeof window === "undefined") {
    return { mode: defaultThemeMode, accent: defaultAccentColor };
  }
  
  const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
  const savedAccent = localStorage.getItem("theme-accent") as AccentColorName;
  
  return {
    mode: (savedMode === "light" || savedMode === "dark") ? savedMode : defaultThemeMode,
    accent: (savedAccent && accentColors[savedAccent]) ? savedAccent : defaultAccentColor,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initialTheme = getInitialTheme();
  const [mode, setModeState] = useState<ThemeMode>(initialTheme.mode);
  const [accentColor, setAccentColorState] = useState<AccentColorName>(initialTheme.accent);
  const [mounted, setMounted] = useState(false);

  // Apply theme immediately on mount and whenever mode/accent changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    
    // Always remove dark class first to ensure clean state, then add if needed
    root.classList.remove("dark");
    if (mode === "dark") {
      root.classList.add("dark");
    }
    
    // Set accent color CSS variable based on current mode
    const accent = accentColors[accentColor];
    const accentValue = mode === "dark" ? accent.dark : accent.light;
    root.style.setProperty("--accent", accentValue);
    
    // Calculate accent dim (20% opacity)
    const rgb = hexToRgb(accentValue);
    if (rgb) {
      root.style.setProperty(
        "--accent-dim",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
      );
    }
    
    // Save to localStorage
    localStorage.setItem("theme-mode", mode);
    localStorage.setItem("theme-accent", accentColor);
    
    setMounted(true);
  }, [mode, accentColor]);

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

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setAccentColor = (newAccent: AccentColorName) => {
    setAccentColorState(newAccent);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode: mounted ? mode : defaultThemeMode,
        accentColor: mounted ? accentColor : defaultAccentColor,
        setMode,
        setAccentColor,
        availableAccentColors: accentColors,
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
