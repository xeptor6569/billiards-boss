"use client";

import { APA9BallGameState } from "@/lib/game-types/apa9ball";
import PoolBall from "./PoolBall";

interface APA9BallScoreDisplayProps {
  gameState: APA9BallGameState;
}

export default function APA9BallScoreDisplay({
  gameState,
}: APA9BallScoreDisplayProps) {
  const { player1, player2, currentPlayer, player1Name, player2Name } = gameState.gameData;
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
                {player1.score}
              </span>
              <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
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
          
          {/* Current Rack Balls Made */}
          {(() => {
            // Combine ballsMade and deadBalls to show all balls made this rack
            const allBalls = [...new Set([...player1.ballsMade, ...player1.deadBalls])];
            return allBalls.length > 0 ? (
              <div className="mb-1.5">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {allBalls.map((ballNumber, index) => {
                    const isDead = player1.deadBalls.includes(ballNumber);
                    return (
                      <PoolBall
                        key={`player1-ball-${ballNumber}-${index}`}
                        ballNumber={ballNumber}
                        size="sm"
                        isPocketed={false}
                        isDead={isDead}
                        ballState={isDead ? 'dead' : undefined}
                        disabled={false}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-auto">
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
                {player2.score}
              </span>
              <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
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
          
          {/* Current Rack Balls Made */}
          {(() => {
            // Combine ballsMade and deadBalls to show all balls made this rack
            const allBalls = [...new Set([...player2.ballsMade, ...player2.deadBalls])];
            return allBalls.length > 0 ? (
              <div className="mb-1.5">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {allBalls.map((ballNumber, index) => {
                    const isDead = player2.deadBalls.includes(ballNumber);
                    return (
                      <PoolBall
                        key={`player2-ball-${ballNumber}-${index}`}
                        ballNumber={ballNumber}
                        size="sm"
                        isPocketed={false}
                        isDead={isDead}
                        ballState={isDead ? 'dead' : undefined}
                        disabled={false}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-auto">
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

