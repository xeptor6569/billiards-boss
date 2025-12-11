"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function ThemeSwitcherCompact() {
  const { mode, accentColor, setMode, setAccentColor, availableAccentColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-slate-700 dark:border-slate-600 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 transition-colors"
        aria-label="Change theme"
        title="Change theme"
      >
        <svg
          className="w-5 h-5 text-slate-400"
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
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-800 shadow-lg z-50">
            {/* Mode Toggle */}
            <div className="p-3 border-b border-slate-700">
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Mode
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMode("light");
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "light"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => {
                    setMode("dark");
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "dark"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            {/* Accent Color Selector */}
            <div className="p-3">
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Accent Color
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(availableAccentColors).map((accent) => {
                  const isSelected = accentColor === accent.name;
                  const accentValue = mode === "dark" ? accent.dark : accent.light;
                  
                  return (
                    <button
                      key={accent.name}
                      onClick={() => {
                        setAccentColor(accent.name);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? "bg-slate-100 text-slate-900"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 border-slate-600"
                        style={{ backgroundColor: accentValue }}
                      />
                      <span className="capitalize">{accent.displayName}</span>
                      {isSelected && (
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
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
