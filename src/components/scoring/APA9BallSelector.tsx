"use client";

import { useState } from "react";
import { APA9BallGameState } from "@/lib/game-types/apa9ball";
import PoolBall from "./PoolBall";

interface APA9BallSelectorProps {
  gameState: APA9BallGameState;
  onBallSelect: (ballNumber: number) => void;
  onBallsConfirm?: (ballNumbers: number[]) => void;
  onSelectionChange?: (ballNumbers: number[]) => void;
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
  const [selectedBalls, setSelectedBalls] = useState<number[]>([]);
  
  // Notify parent of selection changes
  const updateSelection = (newSelection: number[]) => {
    setSelectedBalls(newSelection);
    onSelectionChange?.(newSelection);
  };
  
  const currentPlayer = gameState.gameData.currentPlayer;
  const currentPlayerData = gameState.gameData[currentPlayer === 1 ? 'player1' : 'player2'];
  const otherPlayerData = gameState.gameData[currentPlayer === 1 ? 'player2' : 'player1'];
  
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
  
  const isBallPocketedByCurrentPlayer = (ballNumber: number): boolean => {
    return currentPlayerData.ballsMade.includes(ballNumber);
  };
  
  const isBallPocketedByOtherPlayer = (ballNumber: number): boolean => {
    return otherPlayerData.ballsMade.includes(ballNumber);
  };
  
  const isBallValid = (ballNumber: number): boolean => {
    // Any unpocketed, non-dead ball can be selected
    return !isBallPocketed(ballNumber) && !isBallDead(ballNumber);
  };
  
  const handleBallClick = (ballNumber: number) => {
    if (disabled || isBallPocketed(ballNumber) || isBallDead(ballNumber)) {
      return;
    }
    
    // Toggle selection - allow selecting any unpocketed ball directly
    if (selectedBalls.includes(ballNumber)) {
      const newSelection = selectedBalls.filter(b => b !== ballNumber);
      updateSelection(newSelection);
    } else {
      const newSelection = [...selectedBalls, ballNumber];
      updateSelection(newSelection);
    }
  };
  
  const handleConfirmShot = () => {
    if (selectedBalls.length > 0 && onBallsConfirm) {
      onBallsConfirm(selectedBalls);
      updateSelection([]);
    } else if (selectedBalls.length === 1 && onBallSelect) {
      // Single ball - use old handler for backward compatibility
      onBallSelect(selectedBalls[0]);
      updateSelection([]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-[300px] h-[220px] sm:w-[360px] sm:h-[280px]">
        {RACK_POSITIONS.map(({ row, col, ball }) => {
          const isPocketed = isBallPocketed(ball);
          const isDead = isBallDead(ball);
          const isCurrentPlayer = isBallPocketedByCurrentPlayer(ball);
          const isOtherPlayer = isBallPocketedByOtherPlayer(ball);
          const isValid = isBallValid(ball);
          const isClickable = !disabled && !isPocketed && !isDead && isValid;
          const isSelected = selectedBalls.includes(ball);
          
          return (
            <div
              key={ball}
              className="absolute"
              style={{
                left: `${(col / 8) * 100}%`,
                top: `${(row / 4) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <PoolBall
                ballNumber={ball}
                size="md"
                isPocketed={isPocketed}
                isSelected={isSelected}
                isDead={isDead}
                pocketedBy={isCurrentPlayer ? 'player1' : isOtherPlayer ? 'player2' : undefined}
                onClick={() => handleBallClick(ball)}
                disabled={!isClickable}
              />
            </div>
          );
        })}
      </div>
      
      {/* Instructions and Confirm Button */}
      <div className="mt-4 text-center w-full max-w-md">
        {selectedBalls.length > 0 ? (
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Selected: {selectedBalls.sort((a, b) => a - b).join(', ')}
            </p>
            {onBallsConfirm && (
              <button
                onClick={handleConfirmShot}
                disabled={disabled}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Shot
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              {remainingBalls.length === 0 
                ? "All balls pocketed" 
                : isBreak
                ? "Break - Select balls made"
                : `Hit ball ${lowestBall} first`
              }
            </p>
            {remainingBalls.length > 0 && (
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                {remainingBalls.length} ball{remainingBalls.length !== 1 ? 's' : ''} remaining
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

