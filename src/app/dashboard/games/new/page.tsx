"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState>(createNewGame());
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);

  const handleScoreInput = (balls: number) => {
    if (gameState.isComplete) return;
    const currentFrameIndex = gameState.currentFrame - 1;
    // Calculate remaining (logic duplicated for now, should be shared)
    const currentFrame = gameState.frames[currentFrameIndex];
    const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;

    const ballsToAdd = Math.min(balls, remainingBalls);
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

  const currentFrame = gameState.frames[gameState.currentFrame - 1];
  const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;
  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;

  // Keypad mode logic (duplicated)
  let keypadMode: "shot1" | "shot2" | "break" = "shot1";
  if (shotCount === 0) {
    keypadMode = "break";
  } else if (!isTenthFrame) {
    keypadMode = "shot2";
  } else {
    if (currentFrame.isStrike || currentFrame.isSpare) {
      keypadMode = "shot1";
    } else {
      keypadMode = "shot2";
    }
  }

  const handleSaveGame = async () => {
    if (!gameState || !gameState.isComplete) {
      alert("Please complete the game before saving.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameMode,
          gameState,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.gamesCount !== undefined) {
          alert(
            `Game limit reached! You have ${error.gamesCount}/${error.maxGames} games saved. Upgrade to Premium for unlimited games.`
          );
        } else {
          alert(error.error || "Failed to save game");
        }
        return;
      }

      const game = await response.json();
      router.push(`/dashboard/games/${game.id}`);
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div>
        <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">New Game</div>
        <div className="text-3xl font-black text-[var(--game-accent)]">{gameState.totalScore}</div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcherCompact />
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold text-[var(--game-text-secondary)] hover:text-white"
        >
          EXIT
        </button>
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
            calculateCumulativeScore={() => 0}
            onFrameClick={handleFrameClick}
            isEditable={!gameState.isComplete}
          />
        }
        visualizer={
          <div className="w-full h-full flex flex-col justify-center">
            <RackVisualizer totalPocketed={totalPocketed} remainingBalls={remainingBalls} />
            {gameState.isComplete && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="text-center p-6 bg-[var(--game-surface)] rounded-xl border border-[var(--game-border)] shadow-2xl">
                  <h2 className="text-2xl font-bold mb-2 text-white">Game Complete!</h2>
                  <div className="text-4xl font-black text-[var(--game-accent)] mb-6">{gameState.totalScore}</div>
                  <button
                    onClick={handleSaveGame}
                    disabled={saving}
                    className="w-full py-3 bg-[var(--game-strike)] text-white font-bold rounded-lg mb-3 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save to History"}
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="block w-full text-sm text-[var(--game-text-secondary)] hover:text-white mt-2"
                  >
                    Cancel
                  </button>
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
            disabled={gameState.isComplete || saving}
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

