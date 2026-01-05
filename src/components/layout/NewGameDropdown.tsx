"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStandardGameTypes, getAvailableGameTypes } from "@/lib/game-types";

interface NewGameDropdownProps {
  userId: string;
  hasPremiumAccess: boolean;
  variant?: "desktop" | "mobile";
  onGameSelect?: () => void;
}

interface CustomGame {
  id: number;
  name: string;
  description: string | null;
}

const gameTypeIcons: Record<string, string> = {
  'apa8ball': '🎱',
  'apa9ball': '🎯',
  'bowlliards': '🎳',
  'straight-pool': '📊',
  'custom': '⚙️',
};

export default function NewGameDropdown({
  userId,
  hasPremiumAccess,
  variant = "desktop",
  onGameSelect,
}: NewGameDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);
  const [loadingCustomGames, setLoadingCustomGames] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const standardTypes = getStandardGameTypes();
  const availableTypes = getAvailableGameTypes(hasPremiumAccess);

  useEffect(() => {
    if (hasPremiumAccess && isOpen) {
      loadCustomGames();
    }
  }, [hasPremiumAccess, isOpen]);

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
    return gameTypeId === 'straight-pool' || gameTypeId === 'custom';
  };

  const handleGameTypeSelect = (gameTypeId: string, customGameId?: number) => {
    if (isComingSoon(gameTypeId)) {
      return;
    }
    setIsOpen(false);
    onGameSelect?.();
    if (customGameId) {
      router.push(`/dashboard/games/new?gameType=${gameTypeId}&customGameId=${customGameId}&new=true`);
    } else {
      router.push(`/dashboard/games/new?gameType=${gameTypeId}&new=true`);
    }
  };

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={variant === "desktop" ? "size-5" : "size-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  if (variant === "mobile") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative -top-6 p-5 rounded-full shadow-xl transition-all active:scale-95 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/90 text-white hover:from-[var(--accent)]/90 hover:to-[var(--accent)]/80"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {icon}
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-w-[calc(100vw-2rem)]">
            <div className="max-h-96 overflow-y-auto">
              {/* Standard Game Types */}
              <div className="p-3">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Standard Games
                </div>
                {standardTypes.map((gameType) => {
                  const comingSoon = isComingSoon(gameType.metadata.id);
                  const gameIcon = gameTypeIcons[gameType.metadata.id] || '🎮';
                  return (
                    <button
                      key={gameType.metadata.id}
                      onClick={() => handleGameTypeSelect(gameType.metadata.id)}
                      disabled={comingSoon}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all mb-1 ${
                        comingSoon
                          ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{gameIcon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{gameType.metadata.name}</div>
                            {comingSoon && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                                Soon
                              </span>
                            )}
                          </div>
                          {gameType.metadata.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {gameType.metadata.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Games */}
              {hasPremiumAccess && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>Custom Games</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-white">
                      Premium
                    </span>
                  </div>
                  <button
                    onClick={() => handleGameTypeSelect("custom")}
                    disabled={true}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚙️</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">Custom Game Type</div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                            Soon
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Create your own custom game rules via YAML
                        </div>
                      </div>
                    </div>
                  </button>
                  {loadingCustomGames ? (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      Loading...
                    </div>
                  ) : customGames.length > 0 ? (
                    customGames.map((customGame) => (
                      <button
                        key={customGame.id}
                        onClick={() => handleGameTypeSelect("custom", customGame.id)}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 mb-1"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚙️</span>
                          <div className="flex-1">
                            <div className="font-semibold">{customGame.name}</div>
                            {customGame.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {customGame.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      No custom games yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-md ${
          isOpen
            ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
            : "bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/90 text-white hover:from-[var(--accent)]/90 hover:to-[var(--accent)]/80 hover:shadow-lg"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon}
        <span>New Game</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2.5} 
          stroke="currentColor" 
          className={`size-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 w-full rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {/* Standard Game Types */}
            <div className="p-3">
              <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Standard Games
              </div>
              {standardTypes.map((gameType) => {
                const comingSoon = isComingSoon(gameType.metadata.id);
                const gameIcon = gameTypeIcons[gameType.metadata.id] || '🎮';
                return (
                  <button
                    key={gameType.metadata.id}
                    onClick={() => handleGameTypeSelect(gameType.metadata.id)}
                    disabled={comingSoon}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all mb-1 ${
                      comingSoon
                        ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{gameIcon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{gameType.metadata.name}</div>
                          {comingSoon && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                              Soon
                            </span>
                          )}
                        </div>
                        {gameType.metadata.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {gameType.metadata.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Games */}
            {hasPremiumAccess && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>Custom Games</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-white">
                    Premium
                  </span>
                </div>
                <button
                  onClick={() => handleGameTypeSelect("custom")}
                  disabled={true}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Custom Game Type</div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          Soon
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Create your own custom game rules via YAML
                      </div>
                    </div>
                  </div>
                </button>
                {loadingCustomGames ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading...
                  </div>
                ) : customGames.length > 0 ? (
                  customGames.map((customGame) => (
                    <button
                      key={customGame.id}
                      onClick={() => handleGameTypeSelect("custom", customGame.id)}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 mb-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚙️</span>
                        <div className="flex-1">
                          <div className="font-semibold">{customGame.name}</div>
                          {customGame.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {customGame.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    No custom games yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
