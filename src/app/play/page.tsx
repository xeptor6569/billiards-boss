"use client";

import { useState } from "react";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(createNewGame());
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);

  // Derived state
  const currentFrame = gameState.frames[gameState.currentFrame - 1];
  const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;

  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;

  // Logic to determine keypad mode
  let keypadMode: "shot1" | "shot2" | "break" = "shot1";
  if (shotCount === 0) {
    keypadMode = "break"; // or shot1
  } else if (!isTenthFrame) {
    keypadMode = "shot2";
  } else {
    // 10th frame logic
    if (currentFrame.isStrike) {
      // if strike, next shots are like new breaks/shot1s unless we want spair logic?
      // bowling: X X X.
      keypadMode = "shot1";
    } else if (currentFrame.isSpare) {
      keypadMode = "shot1"; // Bonus shot
    } else {
      keypadMode = "shot2";
    }
  }

  const handleScoreInput = (balls: number) => {
    if (gameState.isComplete) return;

    const currentFrameIndex = gameState.currentFrame - 1;
    const ballsToAdd = Math.min(balls, remainingBalls); // Safety check

    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
  };

  const handleFrameClick = (frameIndex: number) => {
    if (gameState.isComplete) return;
    setEditingFrameIndex(frameIndex);
  };

  const handleModalClose = () => {
    setEditingFrameIndex(null);
  };

  const handleModalSave = (updatedGameState: GameState) => {
    setGameState(updatedGameState);
  };

  const calculateCumulativeScore = (frameIndex: number): number => {
    // Ported from old component - consider moving to lib if used often
    let total = 0;
    for (let i = 0; i <= frameIndex; i++) {
      const frame = gameState.frames[i];
      // simplified cumulative score logic for display
      // Note: Real logic is complex with bonuses. 
      // Ideally we should store cumulative score in state or use a helper
      // For now, using a simplified summing of frame.score which includes bonuses if calculated
      total += frame.score;
    }
    // The original calculateCumulativeScore was more complex to look ahead.
    // For this MVP, let's use the totalScore from state if focused on current, or simple sum
    return gameState.totalScore; // simplified for now
  };

  // Custom Header
  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div>
        <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Score</div>
        <div className="text-3xl font-black text-[var(--accent)]">{gameState.totalScore}</div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcherCompact />
        <Link href="/" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          EXIT
        </Link>
      </div>
    </div>
  );

  const editingFrame =
    editingFrameIndex !== null ? gameState.frames[editingFrameIndex] : null;

  return (
    <>
      <GameLayout
        header={HeaderCmp}
        frameStrip={
          <FrameRibbon
            frames={gameState.frames}
            currentFrameIndex={gameState.currentFrame - 1}
            calculateCumulativeScore={(idx) => {
              // Quick hack used in old component, ideally we fix this properly later
              // For now just return 0 to hide it if we don't want to re-implement full logic here
              return 0;
            }}
            onFrameClick={handleFrameClick}
            isEditable={!gameState.isComplete}
          />
        }
        visualizer={
          <div className="w-full h-full flex flex-col justify-center">
            <RackVisualizer totalPocketed={totalPocketed} remainingBalls={remainingBalls} />
            {gameState.isComplete && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Game Complete!</h2>
                  <div className="text-4xl font-black text-[var(--accent)] mb-6">{gameState.totalScore}</div>
                  <button
                    onClick={() => setGameState(createNewGame())}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg mb-3 hover:opacity-90 transition-opacity"
                  >
                    Play Again
                  </button>
                  <Link href="/auth/signup" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    Sign up to save stats
                  </Link>
                </div>
              </div>
            )}
          </div>
        }
        controls={
          <InputKeypad
            mode={keypadMode}
            remainingBalls={remainingBalls}
            onInput={handleScoreInput}
            disabled={gameState.isComplete}
          />
        }
      />
      {editingFrameIndex !== null && editingFrame && (
        <FrameEditModal
          isOpen={editingFrameIndex !== null}
          frame={editingFrame}
          frameIndex={editingFrameIndex}
          gameState={gameState}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </>
  );
}

