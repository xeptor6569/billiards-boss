"use client";

import { SKILL_LEVEL_TARGETS } from "@/lib/game-types/apa9ball";
import { useState } from "react";

interface APA9BallSkillLevelSelectorProps {
  onConfirm: (player1SL: number, player2SL: number) => void;
  onCancel: () => void;
}

export default function APA9BallSkillLevelSelector({
  onConfirm,
  onCancel,
}: APA9BallSkillLevelSelectorProps) {
  const [player1SL, setPlayer1SL] = useState<number>(3);
  const [player2SL, setPlayer2SL] = useState<number>(3);

  const skillLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Select Skill Levels
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Choose skill levels (1-9) for both players. Target scores are based on The Equalizer® system.
        </p>

        {/* Player 1 Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 1 Skill Level
          </label>
          <div className="grid grid-cols-9 gap-2">
            {skillLevels.map((sl) => (
              <button
                key={sl}
                onClick={() => setPlayer1SL(sl)}
                className={`
                  py-2 px-1 rounded-lg font-bold text-sm transition-all
                  ${player1SL === sl
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {sl}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Target: <span className="font-bold">{SKILL_LEVEL_TARGETS[player1SL]} points</span>
          </div>
        </div>

        {/* Player 2 Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 2 Skill Level
          </label>
          <div className="grid grid-cols-9 gap-2">
            {skillLevels.map((sl) => (
              <button
                key={sl}
                onClick={() => setPlayer2SL(sl)}
                className={`
                  py-2 px-1 rounded-lg font-bold text-sm transition-all
                  ${player2SL === sl
                    ? "bg-red-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {sl}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Target: <span className="font-bold">{SKILL_LEVEL_TARGETS[player2SL]} points</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Player 1 (SL-{player1SL}):</span>
              <span className="font-semibold">{SKILL_LEVEL_TARGETS[player1SL]} points to win</span>
            </div>
            <div className="flex justify-between">
              <span>Player 2 (SL-{player2SL}):</span>
              <span className="font-semibold">{SKILL_LEVEL_TARGETS[player2SL]} points to win</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(player1SL, player2SL)}
            className="flex-1 py-3 px-4 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

