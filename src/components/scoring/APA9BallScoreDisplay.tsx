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
    <div className="w-full p-4 space-y-4">
      {/* Player 1 */}
      <div className={`
        rounded-lg border-2 p-4 transition-all
        ${isPlayer1Turn 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg" 
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        }
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Player 1
            </span>
            {isPlayer1Turn && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                TURN
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              SL-{player1.skillLevel} • Target: {player1.targetScore}
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {player1.score}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400">
              / {player1.targetScore}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage(player1.score, player1.targetScore)}%` }}
          />
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>Innings: {player1.innings}</span>
          <span>Defensive: {player1.defensiveShots}</span>
          <span>Fouls: {player1.fouls}</span>
          <span>Balls: {player1.ballsMade.length}/9</span>
        </div>
      </div>
      
      {/* Player 2 */}
      <div className={`
        rounded-lg border-2 p-4 transition-all
        ${!isPlayer1Turn 
          ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg" 
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        }
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Player 2
            </span>
            {!isPlayer1Turn && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                TURN
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              SL-{player2.skillLevel} • Target: {player2.targetScore}
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600 dark:text-red-400">
              {player2.score}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400">
              / {player2.targetScore}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
          <div
            className="bg-red-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage(player2.score, player2.targetScore)}%` }}
          />
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>Innings: {player2.innings}</span>
          <span>Defensive: {player2.defensiveShots}</span>
          <span>Fouls: {player2.fouls}</span>
          <span>Balls: {player2.ballsMade.length}/9</span>
        </div>
      </div>
    </div>
  );
}

