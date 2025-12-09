"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function ThemeSwitcher() {
  const { themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textPrimary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }}
        aria-label="Change theme"
      >
        <span className="text-sm font-medium">
          {availableThemes.find((t) => t.name === themeName)?.displayName || "Theme"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          style={{ color: 'var(--color-textSecondary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <div className="py-1">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme.name as any);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: themeName === theme.name 
                      ? 'var(--color-primary)' 
                      : 'transparent',
                    color: themeName === theme.name 
                      ? '#ffffff' 
                      : 'var(--color-textPrimary)',
                  }}
                  onMouseEnter={(e) => {
                    if (themeName !== theme.name) {
                      e.currentTarget.style.backgroundColor = 'var(--color-border)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (themeName !== theme.name) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <span>{theme.displayName}</span>
                    {themeName === theme.name && (
                      <svg
                        className="w-4 h-4 ml-auto"
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

