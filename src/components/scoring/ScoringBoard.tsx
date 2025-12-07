"use client";

import { useState, useCallback } from "react";
import {
  GameState,
  Frame,
  createNewGame,
  addBallToFrame,
  getRemainingBalls,
} from "@/lib/game-logic";
import BallTracker from "./BallTracker";
import FrameDisplay from "./FrameDisplay";

interface ScoringBoardProps {
  onScoreUpdate?: (gameState: GameState) => void;
  initialGameState?: GameState;
  disabled?: boolean;
}

export default function ScoringBoard({
  onScoreUpdate,
  initialGameState,
  disabled = false,
}: ScoringBoardProps) {
  const [gameState, setGameState] = useState<GameState>(
    initialGameState || createNewGame()
  );

  const handleBallPocketed = useCallback(
    (ballCount: number) => {
      if (disabled) return;

      const currentFrameIndex = gameState.currentFrame - 1;
      const currentFrame = gameState.frames[currentFrameIndex];

      if (!currentFrame || currentFrame.isComplete) {
        return;
      }

      // Allow 0 for miss, or validate against remaining balls
      const remainingBalls = getRemainingBalls(currentFrame);
      let ballsToAdd: number;
      
      if (ballCount === 0) {
        // Explicit miss - record 0 balls
        ballsToAdd = 0;
      } else {
        // Clamp to remaining balls (handled in addBallToFrame too, but good to do here)
        ballsToAdd = Math.min(ballCount, remainingBalls);
      }

      const newGameState = addBallToFrame(
        gameState,
        currentFrameIndex,
        ballsToAdd
      );

      setGameState(newGameState);
      onScoreUpdate?.(newGameState);
    },
    [gameState, onScoreUpdate, disabled]
  );

  const calculateCumulativeScore = (frameIndex: number): number => {
    let total = 0;
    for (let i = 0; i <= frameIndex; i++) {
      const frame = gameState.frames[i];
      if (frame.isStrike && i < gameState.frames.length - 1) {
        const nextFrame = gameState.frames[i + 1];
        if (nextFrame.ballsPocketed.length >= 2) {
          total += 10 + nextFrame.ballsPocketed[0] + nextFrame.ballsPocketed[1];
        } else if (nextFrame.ballsPocketed.length >= 1 && i < gameState.frames.length - 2) {
          const frameAfterNext = gameState.frames[i + 2];
          total += 10 + nextFrame.ballsPocketed[0] + (frameAfterNext.ballsPocketed[0] || 0);
        } else {
          total += frame.score;
        }
      } else if (frame.isSpare && i < gameState.frames.length - 1) {
        const nextFrame = gameState.frames[i + 1];
        if (nextFrame.ballsPocketed.length >= 1) {
          total += 10 + nextFrame.ballsPocketed[0];
        } else {
          total += frame.score;
        }
      } else {
        total += frame.score;
      }
    }
    return total;
  };

  const currentFrame = gameState.frames[gameState.currentFrame - 1];
  const remainingBalls = currentFrame
    ? getRemainingBalls(currentFrame)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Score Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Total Score: {gameState.totalScore}
        </h2>
        {gameState.isComplete && (
          <p className="mt-2 text-lg text-green-600 dark:text-green-400">
            Game Complete!
          </p>
        )}
      </div>

      {/* Frames Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
        {gameState.frames.map((frame, index) => (
          <FrameDisplay
            key={frame.frameNumber}
            frame={frame}
            isCurrent={index === gameState.currentFrame - 1}
            cumulativeScore={calculateCumulativeScore(index)}
          />
        ))}
      </div>

      {/* Ball Tracker */}
      {!gameState.isComplete && (
        <div className="flex justify-center">
          <BallTracker
            ballsPocketed={currentFrame?.ballsPocketed || []}
            remainingBalls={remainingBalls}
            onBallClick={handleBallPocketed}
            disabled={disabled}
          />
        </div>
      )}

      {/* Game Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {gameState.isComplete ? (
          <p>Great game! Your final score is {gameState.totalScore}.</p>
        ) : (
          <p>
            Frame {gameState.currentFrame} of 10 - {remainingBalls} ball
            {remainingBalls !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>
    </div>
  );
}

