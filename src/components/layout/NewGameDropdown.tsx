"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStandardGameTypes, getAvailableGameTypes } from "@/lib/game-types";

interface NewGameDropdownProps {
  userId: string;
  hasPremiumAccess: boolean;
  variant?: "desktop" | "mobile";
}

interface CustomGame {
  id: number;
  name: string;
  description: string | null;
}

export default function NewGameDropdown({
  userId,
  hasPremiumAccess,
  variant = "desktop",
}: NewGameDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);
  const [loadingCustomGames, setLoadingCustomGames] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get available game types
  const standardTypes = getStandardGameTypes();
  const availableTypes = getAvailableGameTypes(hasPremiumAccess);

  // Load custom games if user has premium access
  useEffect(() => {
    if (hasPremiumAccess && isOpen) {
      loadCustomGames();
    }
  }, [hasPremiumAccess, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const loadCustomGames = async () => {
    setLoadingCustomGames(true);
    try {
      const response = await fetch("/api/custom-games");
      if (response.ok) {
        const games = await response.json();
        setCustomGames(games);
      }
    } catch (error) {
      console.error("Error loading custom games:", error);
    } finally {
      setLoadingCustomGames(false);
    }
  };

  const isComingSoon = (gameTypeId: string) => {
    return gameTypeId === 'apa8ball' || gameTypeId === 'straight-pool' || gameTypeId === 'custom';
  };

  const handleGameTypeSelect = (gameTypeId: string, customGameId?: number) => {
    // Don't allow selection of coming soon games
    if (isComingSoon(gameTypeId)) {
      return;
    }
    setIsOpen(false);
    // Always add new=true to force creating a new game instead of loading existing
    if (customGameId) {
      router.push(`/dashboard/games/new?gameType=${gameTypeId}&customGameId=${customGameId}&new=true`);
    } else {
      router.push(`/dashboard/games/new?gameType=${gameTypeId}&new=true`);
    }
  };

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={variant === "desktop" ? "size-8" : "size-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  const buttonClass = variant === "desktop"
    ? "mt-6 shadow-md justify-center bg-[var(--accent)] text-white hover:opacity-90"
    : "relative -top-5 p-4 rounded-full shadow-lg transition-opacity active:scale-95 bg-[var(--accent)] text-white hover:opacity-90";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${buttonClass}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon}
        {variant === "desktop" && <span>New Game</span>}
        {isOpen && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        )}
        {!isOpen && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-64 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden ${
          variant === "desktop" 
            ? "left-0 mt-2" 
            : "bottom-full mb-2 left-1/2 -translate-x-1/2 max-w-[calc(100vw-1rem)]"
        }`}>
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {/* Standard Game Types */}
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Standard Games
              </div>
              {standardTypes.map((gameType) => {
                const comingSoon = isComingSoon(gameType.metadata.id);
                return (
                  <button
                    key={gameType.metadata.id}
                    onClick={() => handleGameTypeSelect(gameType.metadata.id)}
                    disabled={comingSoon}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      comingSoon
                        ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{gameType.metadata.name}</div>
                      {comingSoon && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500 text-white ml-2">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    {gameType.metadata.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {gameType.metadata.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Games (Premium) */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>Custom Games</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-white">
                  Premium
                </span>
              </div>
              {/* Custom Game Type (Coming Soon) */}
              <button
                onClick={() => handleGameTypeSelect("custom")}
                disabled={true}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">Custom Game Type</div>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500 text-white ml-2">
                    Coming Soon
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create your own custom game rules via YAML
                </div>
              </button>
              {hasPremiumAccess && (
                <>
                  {loadingCustomGames ? (
                    <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      Loading...
                    </div>
                  ) : customGames.length > 0 ? (
                    customGames.map((customGame) => (
                      <button
                        key={customGame.id}
                        onClick={() => handleGameTypeSelect("custom", customGame.id)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="font-medium">{customGame.name}</div>
                        {customGame.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {customGame.description}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      No custom games yet
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

