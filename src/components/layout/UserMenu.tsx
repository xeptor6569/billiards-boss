"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { useTheme } from "@/contexts/ThemeContext";

interface UserMenuProps {
  session: Session;
  variant?: "desktop" | "mobile";
}

export default function UserMenu({ session, variant = "desktop" }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { mode, accentColor, setMode, setAccentColor, availableAccentColors } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowThemeOptions(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
    router.refresh();
  };

  const user = session.user;
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || "U";

  if (variant === "mobile") {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
          aria-label="User menu"
        >
          {initials}
        </button>
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              Profile Settings
            </Link>
            
            {/* Theme Section */}
            <div className="border-t border-slate-200 dark:border-slate-700">
              {!showThemeOptions ? (
                <button
                  onClick={() => setShowThemeOptions(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15M7.21 15l-1.21 2.42A2 2 0 0 0 8.22 20h7.56a2 2 0 0 0 1.22-2.58L16.79 15M7.21 15h9.58M12 3v18"
                    />
                  </svg>
                  <span className="flex-1 text-left">Theme: {mode === "dark" ? "🌙 Dark" : "☀️ Light"} • {accentColor}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Theme Settings
                    </div>
                    <button
                      onClick={() => setShowThemeOptions(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  {/* Mode Toggle */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      Mode
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode("light")}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          mode === "light"
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        ☀️ Light
                      </button>
                      <button
                        onClick={() => setMode("dark")}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          mode === "dark"
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        🌙 Dark
                      </button>
                    </div>
                  </div>

                  {/* Accent Color Selector */}
                  <div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
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
                            }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              isSelected
                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-sm"
                              style={{ backgroundColor: accentValue }}
                            />
                            <span className="capitalize text-xs font-medium">{accent.displayName}</span>
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
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 group"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 text-white text-xs font-bold shadow-md group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {displayName}
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {user.email}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            Profile Settings
          </Link>
          
          {/* Theme Section */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            {!showThemeOptions ? (
              <button
                onClick={() => setShowThemeOptions(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15M7.21 15l-1.21 2.42A2 2 0 0 0 8.22 20h7.56a2 2 0 0 0 1.22-2.58L16.79 15M7.21 15h9.58M12 3v18"
                  />
                </svg>
                <span className="flex-1 text-left">Theme: {mode === "dark" ? "🌙 Dark" : "☀️ Light"} • {accentColor}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Theme Settings
                  </div>
                  <button
                    onClick={() => setShowThemeOptions(false)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    ← Back
                  </button>
                </div>
                
                {/* Mode Toggle */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Mode
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("light")}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === "light"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      ☀️ Light
                    </button>
                    <button
                      onClick={() => setMode("dark")}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === "dark"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>

                {/* Accent Color Selector */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
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
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            isSelected
                              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-sm"
                            style={{ backgroundColor: accentValue }}
                          />
                          <span className="capitalize text-xs font-medium">{accent.displayName}</span>
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
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
