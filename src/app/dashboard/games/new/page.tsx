"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls, reconstructGameStateFromFrames } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import GameSaveSuccessModal from "@/components/scoring/GameSaveSuccessModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedGameId, setSavedGameId] = useState<number | null>(null);
  const hasShotsRef = useRef(false);
  const autoSaveInProgressRef = useRef(false);
  const gameStateRef = useRef<GameState | null>(null);

  // Check for active game on mount
  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        const response = await fetch("/api/games?status=active&limit=1");
        if (response.ok) {
          const activeGames = await response.json();
          if (activeGames.length > 0) {
            const activeGame = activeGames[0];
            // Fetch full game data with frames
            const gameResponse = await fetch(`/api/games/${activeGame.id}`);
            if (gameResponse.ok) {
              const gameData = await response.json();
              if (gameData.frames && gameData.frames.length > 0) {
                const restoredState = reconstructGameStateFromFrames(gameData.frames);
                setGameState(restoredState);
                setSavedGameId(activeGame.id);
                hasShotsRef.current = true;
                setLoading(false);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking for active game:", error);
      }
      // No active game found, start fresh
      setGameState(createNewGame());
      setLoading(false);
    };

    checkActiveGame();
  }, []);

  // Keep gameState ref updated
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Auto-save on exit
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const currentState = gameStateRef.current;
      if (hasShotsRef.current && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        await autoSaveGame(currentState);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also save on component unmount if navigating away
      const currentState = gameStateRef.current;
      if (hasShotsRef.current && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        autoSaveGame(currentState);
      }
    };
  }, []);

  const autoSaveGame = async (stateToSave?: GameState) => {
    const state = stateToSave || gameState;
    if (!state || state.isComplete || autoSaveInProgressRef.current) return;
    
    const hasProgress = state.frames.some(f => f.ballsPocketed.length > 0);
    if (!hasProgress) return;

    try {
      if (savedGameId) {
        // Update existing game
        await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: state,
            status: "active",
          }),
        });
      } else {
        // Create new active game
        const response = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            gameState: state,
          }),
        });
        if (response.ok) {
          const game = await response.json();
          setSavedGameId(game.id);
        }
      }
    } catch (error) {
      console.error("Error auto-saving game:", error);
    } finally {
      autoSaveInProgressRef.current = false;
    }
  };

  const handleScoreInput = (balls: number) => {
    if (!gameState || gameState.isComplete) return;
    const currentFrameIndex = gameState.currentFrame - 1;
    // Calculate remaining (logic duplicated for now, should be shared)
    const currentFrame = gameState.frames[currentFrameIndex];
    const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;

    const ballsToAdd = Math.min(balls, remainingBalls);
    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
    hasShotsRef.current = true;
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
      setSavedGameId(game.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewGame = async () => {
    // Abandon current game if it exists
    if (savedGameId) {
      try {
        await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "abandoned",
          }),
        });
      } catch (error) {
        console.error("Error abandoning game:", error);
      }
    }
    setGameState(createNewGame());
    setShowSuccessModal(false);
    setSavedGameId(null);
    hasShotsRef.current = false;
  };

  const handleExit = async () => {
    // Auto-save before exiting
    if (hasShotsRef.current && gameState && !gameState.isComplete) {
      await autoSaveGame(gameState);
    }
    router.push("/dashboard");
  };

  const editingFrame =
    editingFrameIndex !== null && gameState ? gameState.frames[editingFrameIndex] : null;

  if (loading || !gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--game-bg)]">
        <div className="text-[var(--game-text-primary)]">Loading game...</div>
      </div>
    );
  }

  // Calculate derived state after loading check
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

  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div>
        <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">New Game</div>
        <div className="text-3xl font-black text-[var(--game-accent)]">{gameState.totalScore}</div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcherCompact />
        <button
          onClick={handleExit}
          className="text-sm font-bold text-[var(--game-text-secondary)] hover:text-white"
        >
          EXIT
        </button>
      </div>
    </div>
  );

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
            {gameState.isComplete && !showSuccessModal && (
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
      {gameState && (
        <GameSaveSuccessModal
          isOpen={showSuccessModal}
          totalScore={gameState.totalScore}
          gameId={savedGameId || undefined}
          onNewGame={handleNewGame}
          onDashboard={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}

