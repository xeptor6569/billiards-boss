"use client";

import { useState } from "react";

// Import the rack target matrix lookup function
function getRackTargets(player1SL: number, player2SL: number): { player1: number; player2: number } {
  const RACK_TARGET_MATRIX: Record<number, Record<number, { you: number; opponent: number }>> = {
    2: { 2: { you: 2, opponent: 2 }, 3: { you: 2, opponent: 3 }, 4: { you: 2, opponent: 4 }, 5: { you: 2, opponent: 5 }, 6: { you: 2, opponent: 6 }, 7: { you: 2, opponent: 7 } },
    3: { 2: { you: 3, opponent: 2 }, 3: { you: 2, opponent: 2 }, 4: { you: 2, opponent: 3 }, 5: { you: 2, opponent: 4 }, 6: { you: 2, opponent: 5 }, 7: { you: 2, opponent: 6 } },
    4: { 2: { you: 4, opponent: 2 }, 3: { you: 3, opponent: 2 }, 4: { you: 3, opponent: 3 }, 5: { you: 3, opponent: 4 }, 6: { you: 3, opponent: 5 }, 7: { you: 2, opponent: 5 } },
    5: { 2: { you: 5, opponent: 2 }, 3: { you: 4, opponent: 2 }, 4: { you: 4, opponent: 3 }, 5: { you: 4, opponent: 4 }, 6: { you: 4, opponent: 5 }, 7: { you: 3, opponent: 5 } },
    6: { 2: { you: 6, opponent: 2 }, 3: { you: 5, opponent: 2 }, 4: { you: 5, opponent: 3 }, 5: { you: 5, opponent: 4 }, 6: { you: 5, opponent: 5 }, 7: { you: 4, opponent: 5 } },
    7: { 2: { you: 7, opponent: 2 }, 3: { you: 6, opponent: 2 }, 4: { you: 5, opponent: 2 }, 5: { you: 5, opponent: 3 }, 6: { you: 5, opponent: 4 }, 7: { you: 5, opponent: 5 } },
  };
  const targets = RACK_TARGET_MATRIX[player1SL]?.[player2SL];
  if (!targets) {
    return { player1: 2, player2: 2 };
  }
  return { player1: targets.you, player2: targets.opponent };
}

interface APA8BallSkillLevelSelectorProps {
  onConfirm: (player1SL: number, player2SL: number, player1Name: string, player2Name: string) => void;
  onCancel: () => void;
}

export default function APA8BallSkillLevelSelector({
  onConfirm,
  onCancel,
}: APA8BallSkillLevelSelectorProps) {
  const [player1SL, setPlayer1SL] = useState<number>(3);
  const [player2SL, setPlayer2SL] = useState<number>(3);
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');

  const skillLevels = [2, 3, 4, 5, 6, 7]; // 8-ball uses SL 2-7
  const rackTargets = getRackTargets(player1SL, player2SL);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Select Skill Levels
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Choose skill levels (2-7) for both players. Rack targets are based on The Equalizer® system.
        </p>

        {/* Player 1 Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 1 Name
          </label>
          <input
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Player 1"
          />
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 1 Skill Level
          </label>
          <div className="grid grid-cols-6 gap-2">
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
            Target: <span className="font-bold">{rackTargets.player1} racks</span>
          </div>
        </div>

        {/* Player 2 Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 2 Name
          </label>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Player 2"
          />
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Player 2 Skill Level
          </label>
          <div className="grid grid-cols-6 gap-2">
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
            Target: <span className="font-bold">{rackTargets.player2} racks</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{player1Name} (SL-{player1SL}):</span>
              <span className="font-semibold">{rackTargets.player1} racks to win</span>
            </div>
            <div className="flex justify-between">
              <span>{player2Name} (SL-{player2SL}):</span>
              <span className="font-semibold">{rackTargets.player2} racks to win</span>
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
            onClick={() => onConfirm(player1SL, player2SL, player1Name.trim() || 'Player 1', player2Name.trim() || 'Player 2')}
            className="flex-1 py-3 px-4 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

