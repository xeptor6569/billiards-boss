"use client";

import { useState, useCallback } from "react";
import {
  GameState,
  Frame,
  createNewGame,
  addBallToFrame,
  getRemainingBalls,
} from "@/lib/game-logic";
import FrameRibbon from "./FrameRibbon";
import RackVisualizer from "./RackVisualizer";
import ControlDeck from "./ControlDeck";

interface ModernScoringBoardProps {
  onScoreUpdate?: (gameState: GameState) => void;
  initialGameState?: GameState;
  disabled?: boolean;
}

export default function ModernScoringBoard({
  onScoreUpdate,
  initialGameState,
  disabled = false,
}: ModernScoringBoardProps) {
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

      const remainingBalls = getRemainingBalls(currentFrame);
      let ballsToAdd: number;
      
      if (ballCount === 0) {
        ballsToAdd = 0;
      } else {
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
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;
  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;
  const isShot1 = shotCount === 0;
  const isShot2 = shotCount === 1 && (!currentFrame?.isStrike || !isTenthFrame);
  const isShot3 = isTenthFrame && shotCount === 2 && (currentFrame?.isStrike || currentFrame?.isSpare);

  return (
    <div className="relative flex flex-col h-full text-zinc-100 overflow-hidden rounded-lg shadow-2xl" style={{ backgroundColor: "#09090b" }}>
      {/* Top 20%: Frame Ribbon - slightly taller to accommodate scaled frames */}
      <div className="h-[22%] flex-shrink-0 border-b" style={{ borderColor: "#27272a" }}>
        <FrameRibbon
          frames={gameState.frames}
          currentFrameIndex={gameState.currentFrame - 1}
          calculateCumulativeScore={calculateCumulativeScore}
        />
      </div>

      {/* Middle 28%: Rack Visualizer - adjusted to compensate for ribbon height */}
      <div className="h-[28%] flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#18181b" }}>
        <RackVisualizer
          totalPocketed={totalPocketed}
          remainingBalls={remainingBalls}
        />
      </div>

      {/* Bottom 50%: Control Deck */}
      <div className="h-[50%] flex-shrink-0" style={{ backgroundColor: "#09090b" }}>
        <ControlDeck
          isShot1={isShot1}
          isShot2={isShot2 || isShot3}
          remainingBalls={remainingBalls}
          onBallPocketed={handleBallPocketed}
          disabled={disabled}
          currentFrame={currentFrame}
        />
      </div>

      {/* Total Score Display (positioned relative to board) */}
      <div className="absolute top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-10" style={{ backgroundColor: "#22c55e" }}>
        <div className="text-xs" style={{ color: "#f4f4f5", opacity: 0.9 }}>Total Score</div>
        <div className="text-2xl font-bold" style={{ color: "#f4f4f5" }}>{gameState.totalScore}</div>
      </div>
    </div>
  );
}

