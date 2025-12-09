"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function ThemeSwitcherCompact() {
  const { themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-[var(--game-border)] bg-[var(--game-surface)] hover:bg-[var(--game-border)] transition-colors"
        aria-label="Change theme"
        title="Change theme"
      >
        <svg
          className="w-5 h-5 text-[var(--game-text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[var(--game-border)] bg-[var(--game-surface)] shadow-lg z-50">
            <div className="py-1">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme.name as any);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    themeName === theme.name
                      ? "bg-[var(--game-accent)]/20 text-[var(--game-accent)]"
                      : "text-[var(--game-text-primary)] hover:bg-[var(--game-border)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-[var(--game-border)]"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span>{theme.displayName}</span>
                    {themeName === theme.name && (
                      <svg
                        className="w-4 h-4 ml-auto text-[var(--game-accent)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

