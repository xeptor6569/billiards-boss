"use client";

import { APA9BallGameState } from "@/lib/game-types/apa9ball";

interface APA9BallSelectorProps {
  gameState: APA9BallGameState;
  onBallSelect: (ballNumber: number) => void;
  disabled?: boolean;
}

// 9-ball rack positions (diamond formation)
const RACK_POSITIONS = [
  { row: 0, col: 4, ball: 1 }, // Ball 1 (top)
  { row: 1, col: 3, ball: 2 }, // Ball 2
  { row: 1, col: 5, ball: 3 }, // Ball 3
  { row: 2, col: 2, ball: 4 }, // Ball 4
  { row: 2, col: 4, ball: 9 }, // Ball 9 (center)
  { row: 2, col: 6, ball: 5 }, // Ball 5
  { row: 3, col: 1, ball: 6 }, // Ball 6
  { row: 3, col: 3, ball: 7 }, // Ball 7
  { row: 3, col: 5, ball: 8 }, // Ball 8
];

export default function APA9BallSelector({
  gameState,
  onBallSelect,
  disabled = false,
}: APA9BallSelectorProps) {
  const currentPlayer = gameState.gameData.currentPlayer;
  const currentPlayerData = gameState.gameData[currentPlayer === 1 ? 'player1' : 'player2'];
  const otherPlayerData = gameState.gameData[currentPlayer === 1 ? 'player2' : 'player1'];
  
  // Get all balls made by both players
  const allBallsMade = [...new Set([
    ...gameState.gameData.player1.ballsMade,
    ...gameState.gameData.player2.ballsMade
  ])];
  
  // Find the lowest remaining ball (must hit this first)
  const remainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !allBallsMade.includes(b));
  const lowestBall = remainingBalls.length > 0 ? Math.min(...remainingBalls) : 9;
  
  const isBallPocketed = (ballNumber: number): boolean => {
    return allBallsMade.includes(ballNumber);
  };
  
  const isBallPocketedByCurrentPlayer = (ballNumber: number): boolean => {
    return currentPlayerData.ballsMade.includes(ballNumber);
  };
  
  const isBallPocketedByOtherPlayer = (ballNumber: number): boolean => {
    return otherPlayerData.ballsMade.includes(ballNumber);
  };
  
  const isBallValid = (ballNumber: number): boolean => {
    // Can only select the lowest remaining ball (or 9 if it's the only one left)
    return !isBallPocketed(ballNumber) && (ballNumber === lowestBall || (ballNumber === 9 && lowestBall === 9));
  };
  
  const getBallColor = (ballNumber: number): string => {
    if (ballNumber === 9) {
      return "bg-yellow-500 border-yellow-600"; // 9-ball is yellow
    }
    // Standard ball colors (simplified - using accent color for all)
    return "bg-[var(--accent)] border-amber-500";
  };
  
  const handleBallClick = (ballNumber: number) => {
    if (disabled || isBallPocketed(ballNumber) || !isBallValid(ballNumber)) {
      return;
    }
    onBallSelect(ballNumber);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-[280px] h-[200px] sm:w-[320px] sm:h-[240px]">
        {RACK_POSITIONS.map(({ row, col, ball }) => {
          const isPocketed = isBallPocketed(ball);
          const isCurrentPlayer = isBallPocketedByCurrentPlayer(ball);
          const isOtherPlayer = isBallPocketedByOtherPlayer(ball);
          const isValid = isBallValid(ball);
          const isClickable = !disabled && !isPocketed && isValid;
          
          return (
            <button
              key={ball}
              onClick={() => handleBallClick(ball)}
              disabled={!isClickable}
              className={`
                absolute rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center
                text-sm sm:text-base font-bold transition-all duration-300
                ${isPocketed 
                  ? "bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 opacity-40 cursor-not-allowed" 
                  : isValid && isClickable
                  ? `${getBallColor(ball)} border-2 shadow-lg hover:scale-110 active:scale-95 cursor-pointer`
                  : "bg-slate-300 dark:bg-slate-600 border-2 border-slate-400 dark:border-slate-500 opacity-50 cursor-not-allowed"
                }
                ${isCurrentPlayer ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                ${isOtherPlayer ? "ring-2 ring-red-500 ring-offset-2" : ""}
              `}
              style={{
                left: `${(col / 8) * 100}%`,
                top: `${(row / 4) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={
                isPocketed 
                  ? `Ball ${ball} already pocketed${isCurrentPlayer ? " by you" : isOtherPlayer ? " by opponent" : ""}`
                  : isValid 
                  ? `Click to pocket ball ${ball}${ball === 9 ? " (2 points)" : " (1 point)"}`
                  : `Must hit ball ${lowestBall} first`
              }
            >
              {!isPocketed && (
                <span className="font-bold text-white drop-shadow-md">
                  {ball}
                </span>
              )}
              {isPocketed && (
                <span className="text-xs text-slate-500 dark:text-slate-400 line-through">
                  {ball}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          {remainingBalls.length === 0 
            ? "All balls pocketed" 
            : `Hit ball ${lowestBall} first`
          }
        </p>
        {remainingBalls.length > 0 && (
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            {remainingBalls.length} ball{remainingBalls.length !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    </div>
  );
}

