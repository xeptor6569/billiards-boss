"use client";

import { APA9BallGameState } from "@/lib/game-types/apa9ball";

interface APA9BallMatchPointsProps {
  gameState: APA9BallGameState;
}

export default function APA9BallMatchPoints({
  gameState,
}: APA9BallMatchPointsProps) {
  const { player1, player2, matchPoints, gameStatus, breakAndRun, player1Name, player2Name } = gameState.gameData;
  
  if (!matchPoints) {
    return null;
  }
  
  const player1Won = gameStatus === 'player1-won';
  const player2Won = gameStatus === 'player2-won';
  const totalPoints = matchPoints.player1 + matchPoints.player2;
  
  return (
    <div className="w-full p-4 space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Match Results
        </h3>
        {breakAndRun && (
          <div className="inline-block px-3 py-1 bg-amber-500 text-white text-sm font-bold rounded-full mb-2">
            Break & Run!
          </div>
        )}
      </div>
      
      {/* Match Points Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 */}
        <div className={`
          rounded-lg border-2 p-4 text-center
          ${player1Won
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            {player1Name}
          </div>
          <div className="text-3xl font-black mb-1">
            <span className={player1Won ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}>
              {player1.score}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-500">/{player1.targetScore}</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            SL-{player1.skillLevel} | {matchPoints.player1} match points
          </div>
          {player1Won && (
            <div className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              WINNER
            </div>
          )}
        </div>
        
        {/* Player 2 */}
        <div className={`
          rounded-lg border-2 p-4 text-center
          ${player2Won
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          }
        `}>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            {player2Name}
          </div>
          <div className="text-3xl font-black mb-1">
            <span className={player2Won ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}>
              {player2.score}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-500">/{player2.targetScore}</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            SL-{player2.skillLevel} | {matchPoints.player2} match points
          </div>
          {player2Won && (
            <div className="mt-2 text-xs font-bold text-red-600 dark:text-red-400">
              WINNER
            </div>
          )}
        </div>
      </div>
      
      {/* Game Summary */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>{player1Name} (SL-{player1.skillLevel}):</span>
            <span className="font-semibold">{player1.score} / {player1.targetScore}</span>
          </div>
          <div className="flex justify-between">
            <span>{player2Name} (SL-{player2.skillLevel}):</span>
            <span className="font-semibold">{player2.score} / {player2.targetScore}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-600">
            <span>Total Match Points:</span>
            <span className="font-bold">{totalPoints} / 20</span>
          </div>
        </div>
      </div>
    </div>
  );
}

