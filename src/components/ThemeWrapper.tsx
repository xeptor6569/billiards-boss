"use client";

import { Theme } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode, accentColor, resolvedTheme } = useTheme();
  
  // Map pool hall accent colors to Radix Themes accent colors
  // Radix Themes supports: gray, gold, bronze, brown, yellow, amber, orange, tomato, red, ruby, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, lime, mint
  const accentColorMap: Record<string, "green" | "brown" | "blue" | "amber"> = {
    "pool-green": "green",
    "pool-wood": "brown",
    "pool-blue": "blue",
    "pool-amber": "amber",
  };
  
  // Use resolvedTheme if available (from next-themes), otherwise fall back to mode
  const appearance = (resolvedTheme || mode) === "dark" ? "dark" : "light";
  
  return (
    <Theme
      appearance={appearance}
      accentColor={accentColorMap[accentColor] || "green"}
      radius="medium"
      scaling="100%"
    >
      {children}
    </Theme>
  );
}
