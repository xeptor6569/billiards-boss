"use client";

import { useState } from "react";
import { APA9BallGameState } from "@/lib/game-types/apa9ball";
import PoolBall from "./PoolBall";

interface APA9BallSelectorProps {
  gameState: APA9BallGameState;
  onBallSelect: (ballNumber: number) => void;
  onBallsConfirm?: (ballNumbers: number[]) => void;
  onSelectionChange?: (ballStates: Record<number, 'pocketed' | 'dead'>) => void;
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
  onBallsConfirm,
  onSelectionChange,
  disabled = false,
}: APA9BallSelectorProps) {
  const [ballStates, setBallStates] = useState<Record<number, 'pocketed' | 'dead'>>({});
  
  // Notify parent of selection changes
  const updateBallStates = (newStates: Record<number, 'pocketed' | 'dead'>) => {
    setBallStates(newStates);
    onSelectionChange?.(newStates);
  };
  
  // Check if this is the break
  const isBreak = gameState.gameData.breakPlayer === null && 
                  gameState.gameData.player1.innings === 0 && 
                  gameState.gameData.player2.innings === 0;
  
  // Get all balls made by both players (including dead balls)
  const allBallsMade = [...new Set([
    ...gameState.gameData.player1.ballsMade,
    ...gameState.gameData.player2.ballsMade,
    ...gameState.gameData.player1.deadBalls,
    ...gameState.gameData.player2.deadBalls
  ])];
  
  // Find the lowest remaining ball (must hit this first, except on break)
  const remainingBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(b => !allBallsMade.includes(b));
  const lowestBall = remainingBalls.length > 0 ? Math.min(...remainingBalls) : 9;
  
  const isBallPocketed = (ballNumber: number): boolean => {
    return gameState.gameData.player1.ballsMade.includes(ballNumber) ||
           gameState.gameData.player2.ballsMade.includes(ballNumber);
  };
  
  const isBallDead = (ballNumber: number): boolean => {
    return gameState.gameData.player1.deadBalls.includes(ballNumber) ||
           gameState.gameData.player2.deadBalls.includes(ballNumber);
  };
  
  const isBallPocketedByPlayer1 = (ballNumber: number): boolean => {
    return gameState.gameData.player1.ballsMade.includes(ballNumber);
  };
  
  const isBallPocketedByPlayer2 = (ballNumber: number): boolean => {
    return gameState.gameData.player2.ballsMade.includes(ballNumber);
  };
  
  const isBallValid = (ballNumber: number): boolean => {
    // Any unpocketed, non-dead ball can be selected
    return !isBallPocketed(ballNumber) && !isBallDead(ballNumber);
  };
  
  const handleBallClick = (ballNumber: number) => {
    // Allow clicking balls that are already pocketed or dead to cycle their state
    // But don't allow clicking if the ball is already pocketed/dead in the game state
    // (those are final states from previous shots)
    const currentState = ballStates[ballNumber];
    
    if (!currentState) {
      // First click: mark as pocketed
      updateBallStates({ ...ballStates, [ballNumber]: 'pocketed' });
    } else if (currentState === 'pocketed') {
      // Second click: mark as dead
      updateBallStates({ ...ballStates, [ballNumber]: 'dead' });
    } else if (currentState === 'dead') {
      // Third click: remove (back to active)
      const newStates = { ...ballStates };
      delete newStates[ballNumber];
      updateBallStates(newStates);
    }
  };
  
  const handleConfirmShot = () => {
    const allSelectedBalls = Object.keys(ballStates).map(Number);
    if (allSelectedBalls.length > 0 && onBallsConfirm) {
      onBallsConfirm(allSelectedBalls);
      updateBallStates({});
    } else if (allSelectedBalls.length === 1 && onBallSelect) {
      // Single ball - use old handler for backward compatibility
      onBallSelect(allSelectedBalls[0]);
      updateBallStates({});
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-[300px] h-[240px] sm:w-[360px] sm:h-[300px] overflow-visible">
        {RACK_POSITIONS.map(({ row, col, ball }) => {
          const isPocketed = isBallPocketed(ball);
          const isDead = isBallDead(ball);
          const isPocketedByPlayer1 = isBallPocketedByPlayer1(ball);
          const isPocketedByPlayer2 = isBallPocketedByPlayer2(ball);
          const isValid = isBallValid(ball);
          // Allow clicking if ball is in selection state (even if already pocketed/dead in game)
          const ballState = ballStates[ball];
          const isClickable = !disabled && (isValid || ballState !== undefined);
          const isSelected = ballState !== undefined;
          
          // Determine which player pocketed this ball (for color indicator)
          // Only show player color if ball is actually pocketed in game state, not just selected
          let pocketedBy: 'player1' | 'player2' | undefined = undefined;
          if (isPocketed && !isDead && !isSelected) {
            if (isPocketedByPlayer1) {
              pocketedBy = 'player1';
            } else if (isPocketedByPlayer2) {
              pocketedBy = 'player2';
            }
          }
          
          // When ball is selected, don't grey it out - keep it in normal state
          // The selection ring and checkmark will indicate it's selected
          const shouldShowAsPocketed = isPocketed && !isSelected;
          const shouldShowAsDead = isDead && !isSelected;
          
          // Calculate adjusted positions to prevent overlap
          // Ball 1 needs extra top padding to prevent overflow
          // Outer balls (6, 7, 8) need slight adjustments to prevent ring overlap
          const topOffset = ball === 1 ? 3 : 0; // Extra padding for ball 1 at top
          const leftOffset = 0; // Keep horizontal positioning as-is
          
          return (
            <div
              key={ball}
              className="absolute"
              style={{
                left: `${(col / 8) * 100 + leftOffset}%`,
                top: `${(row / 4) * 100 + topOffset}%`,
                transform: 'translate(-50%, -50%)',
                // Add z-index to prevent overlapping - outer balls have higher z-index
                zIndex: ball === 1 ? 10 : ball === 2 || ball === 3 ? 9 : ball === 4 || ball === 5 ? 8 : 7,
              }}
            >
              <PoolBall
                ballNumber={ball}
                size="lg"
                isPocketed={shouldShowAsPocketed}
                isSelected={isSelected}
                isDead={shouldShowAsDead}
                pocketedBy={pocketedBy}
                onClick={() => handleBallClick(ball)}
                disabled={!isClickable}
                ballState={ballState}
              />
            </div>
          );
        })}
      </div>
      
      {/* Instructions and Confirm Button */}
      <div className="mt-4 text-center w-full max-w-md">
        {Object.keys(ballStates).length > 0 && onBallsConfirm ? (
          <button
            onClick={handleConfirmShot}
            disabled={disabled}
            className="px-6 py-3 bg-blue-500 text-white text-base sm:text-lg font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Shot ({Object.keys(ballStates).length} ball{Object.keys(ballStates).length !== 1 ? 's' : ''})
          </button>
        ) : (
          <>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-medium">
              {remainingBalls.length === 0 
                ? "All balls pocketed" 
                : isBreak
                ? "Break - Select balls made"
                : `Hit ball ${lowestBall} first`
              }
            </p>
            {remainingBalls.length > 0 && (
              <p className="text-slate-500 dark:text-slate-500 text-sm sm:text-base mt-1">
                {remainingBalls.length} ball{remainingBalls.length !== 1 ? 's' : ''} remaining
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

