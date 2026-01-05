"use client";

import { APA8BallGameState } from "@/lib/game-types/apa8ball";

interface APA8BallScoreDisplayProps {
  gameState: APA8BallGameState;
}

export default function APA8BallScoreDisplay({
  gameState,
}: APA8BallScoreDisplayProps) {
  const { player1, player2, currentPlayer, player1Name, player2Name } = gameState.gameData;
  const isPlayer1Turn = currentPlayer === 1;
  
  const getProgressPercentage = (racksWon: number, target: number): number => {
    return Math.min(100, (racksWon / target) * 100);
  };
  
  return (
    <div className="w-full h-full p-2 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-2 gap-2 h-full min-h-0">
        {/* Player 1 */}
        <div className={`
          rounded-lg border-2 p-3 transition-all flex flex-col min-h-0
          ${isPlayer1Turn 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {player1Name}
              </span>
              {isPlayer1Turn && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs sm:text-sm font-bold rounded">
                  TURN
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                SL-{player1.skillLevel}
              </div>
            </div>
          </div>
          
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                {player1.racksWon}
              </span>
              <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
                / {player1.rackTarget}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Racks Won
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1.5">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(player1.racksWon, player1.rackTarget)}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-auto">
            <span>I: {player1.innings}</span>
            <span>D: {player1.defensiveShots}</span>
            <span>F: {player1.fouls}</span>
            <span>T: {player1.timeoutsRemaining}</span>
          </div>
        </div>
        
        {/* Player 2 */}
        <div className={`
          rounded-lg border-2 p-3 transition-all flex flex-col min-h-0
          ${!isPlayer1Turn 
            ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {player2Name}
              </span>
              {!isPlayer1Turn && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded">
                  TURN
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                SL-{player2.skillLevel}
              </div>
            </div>
          </div>
          
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-400">
                {player2.racksWon}
              </span>
              <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
                / {player2.rackTarget}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Racks Won
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1.5">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(player2.racksWon, player2.rackTarget)}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-auto">
            <span>I: {player2.innings}</span>
            <span>D: {player2.defensiveShots}</span>
            <span>F: {player2.fouls}</span>
            <span>T: {player2.timeoutsRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

