"use client";

import { APA9BallGameState } from "@/lib/game-types/apa9ball";

interface APA9BallScoreDisplayProps {
  gameState: APA9BallGameState;
}

export default function APA9BallScoreDisplay({
  gameState,
}: APA9BallScoreDisplayProps) {
  const { player1, player2, currentPlayer } = gameState.gameData;
  const isPlayer1Turn = currentPlayer === 1;
  
  const getProgressPercentage = (score: number, target: number): number => {
    return Math.min(100, (score / target) * 100);
  };
  
  return (
    <div className="w-full h-full p-2">
      <div className="grid grid-cols-2 gap-2 h-full">
        {/* Player 1 */}
        <div className={`
          rounded-lg border-2 p-3 transition-all flex flex-col
          ${isPlayer1Turn 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Player 1
              </span>
              {isPlayer1Turn && (
                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                  TURN
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                SL-{player1.skillLevel}
              </div>
            </div>
          </div>
          
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {player1.score}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                / {player1.targetScore}
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1.5">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(player1.score, player1.targetScore)}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400 mt-auto">
            <span>I: {player1.innings}</span>
            <span>D: {player1.defensiveShots}</span>
            <span>F: {player1.fouls}</span>
            <span>B: {player1.ballsMade.length}/9</span>
          </div>
        </div>
        
        {/* Player 2 */}
        <div className={`
          rounded-lg border-2 p-3 transition-all flex flex-col
          ${!isPlayer1Turn 
            ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Player 2
              </span>
              {!isPlayer1Turn && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                  TURN
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                SL-{player2.skillLevel}
              </div>
            </div>
          </div>
          
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-600 dark:text-red-400">
                {player2.score}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                / {player2.targetScore}
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1.5">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(player2.score, player2.targetScore)}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400 mt-auto">
            <span>I: {player2.innings}</span>
            <span>D: {player2.defensiveShots}</span>
            <span>F: {player2.fouls}</span>
            <span>B: {player2.ballsMade.length}/9</span>
          </div>
        </div>
      </div>
    </div>
  );
}

