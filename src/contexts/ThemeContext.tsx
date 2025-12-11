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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(defaultThemeMode);
  const [accentColor, setAccentColorState] = useState<AccentColorName>(defaultAccentColor);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme preferences from localStorage
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    const savedAccent = localStorage.getItem("theme-accent") as AccentColorName;
    
    if (savedMode === "light" || savedMode === "dark") {
      setModeState(savedMode);
    }
    
    if (savedAccent && accentColors[savedAccent]) {
      setAccentColorState(savedAccent);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Toggle dark class for Tailwind dark mode
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
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
  }, [mode, accentColor, mounted]);

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
