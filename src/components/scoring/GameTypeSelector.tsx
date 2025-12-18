"use client";

import { useState } from "react";
import { getAllGameTypes, getStandardGameTypes, GameType } from "@/lib/game-types";
import { checkCustomGamesAccess } from "@/lib/plan-checks";

interface GameTypeSelectorProps {
  onSelect: (gameTypeId: string, customGameId?: number) => void;
  onCancel: () => void;
  hasPremiumAccess?: boolean;
}

export default function GameTypeSelector({
  onSelect,
  onCancel,
  hasPremiumAccess = false,
}: GameTypeSelectorProps) {
  const [selectedCustomGame, setSelectedCustomGame] = useState<number | null>(null);
  const [customGames, setCustomGames] = useState<any[]>([]);
  const [loadingCustomGames, setLoadingCustomGames] = useState(false);

  // Get available game types
  const standardTypes = getStandardGameTypes();
  const allTypes = getAllGameTypes();
  const customTypes = allTypes.filter(gt => gt.metadata.category === 'custom');
  const availableCustomTypes = customTypes.filter(gt => !gt.metadata.requiresPayment || hasPremiumAccess);

  // Load custom games when custom type is selected
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

  const handleGameTypeClick = (gameType: GameType) => {
    if (gameType.metadata.id === 'custom') {
      loadCustomGames();
    } else {
      onSelect(gameType.metadata.id);
    }
  };

  const handleCustomGameSelect = (customGameId: number) => {
    onSelect('custom', customGameId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Select Game Type
          </h2>

          {/* Standard Game Types */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Standard Games
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standardTypes.map((gameType) => (
                <button
                  key={gameType.metadata.id}
                  onClick={() => handleGameTypeClick(gameType)}
                  className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left"
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {gameType.metadata.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {gameType.metadata.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Games */}
          {availableCustomTypes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Custom Games {!hasPremiumAccess && "(Premium)"}
              </h3>
              {loadingCustomGames ? (
                <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                  Loading custom games...
                </div>
              ) : customGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customGames.map((customGame) => (
                    <button
                      key={customGame.id}
                      onClick={() => handleCustomGameSelect(customGame.id)}
                      className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {customGame.name}
                      </div>
                      {customGame.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {customGame.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                  No custom games yet. Create one in your profile.
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

