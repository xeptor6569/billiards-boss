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
  const [gameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedGameId, setSavedGameId] = useState<number | null>(null);
  const hasShotsRef = useRef(false);
  const autoSaveInProgressRef = useRef(false);
  const gameStateRef = useRef<GameState | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedGameIdRef = useRef<number | null>(null);
  const gameModeRef = useRef<"single" | "multiplayer" | "tournament">("single");

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

  const handleGameCompletion = async () => {
    if (!gameState || !gameState.isComplete) return;
    
    console.log("Game completed! Auto-saving as completed...", {
      savedGameId,
      totalScore: gameState.totalScore
    });
    
    try {
      if (savedGameId) {
        // Update existing game to completed
        const response = await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState,
            status: "completed",
            completedAt: new Date().toISOString(),
          }),
        });
        if (response.ok) {
          console.log("Game saved as completed (updated existing)");
        } else {
          const errorText = await response.text();
          console.error("Failed to save completed game:", errorText);
        }
      } else {
        // Create new completed game
        const response = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            gameState,
          }),
        });
        if (response.ok) {
          const game = await response.json();
          setSavedGameId(game.id);
          console.log("Game saved as completed, created new game:", game.id);
        } else {
          const errorText = await response.text();
          console.error("Failed to create completed game:", errorText);
        }
      }
    } catch (error) {
      console.error("Error saving completed game:", error);
    }
  };

  // Keep refs updated
  useEffect(() => {
    gameStateRef.current = gameState;
    savedGameIdRef.current = savedGameId;
    gameModeRef.current = gameMode;
  }, [gameState, savedGameId, gameMode]);

  // Keep gameState ref updated and handle completion
  useEffect(() => {
    if (gameState) {
      console.log("GameState updated:", {
        currentFrame: gameState.currentFrame,
        totalScore: gameState.totalScore,
        isComplete: gameState.isComplete,
        framesWithShots: gameState.frames.filter(f => f.ballsPocketed.length > 0).map(f => ({
          frame: f.frameNumber,
          shots: f.ballsPocketed
        }))
      });
      
      // Auto-save when game completes
      if (gameState.isComplete && !showSuccessModal) {
        handleGameCompletion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, showSuccessModal]);

  // Save on component unmount (backup for navigation)
  useEffect(() => {
    return () => {
      // Also save on component unmount if navigating away
      const currentState = gameStateRef.current;
      if (hasShotsRef.current && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        autoSaveGame(currentState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoSaveGame = async (stateToSave?: GameState) => {
    const state = stateToSave || gameState;
    if (!state || state.isComplete || autoSaveInProgressRef.current) return;
    
    const hasProgress = state.frames.some(f => f.ballsPocketed.length > 0);
    if (!hasProgress) return;

    autoSaveInProgressRef.current = true;
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
    
    // Auto-save after each shot (debounced to avoid too many saves)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveGame(newGameState);
    }, 1000);
  };

  const handleFrameClick = (frameIndex: number) => {
    if (!gameState || gameState.isComplete) return;
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
      let response;
      if (savedGameId) {
        // Update existing game to completed
        response = await fetch(`/api/games/${savedGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState,
            status: "completed",
            completedAt: new Date().toISOString(),
          }),
        });
      } else {
        // Create new completed game
        response = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            gameState,
          }),
        });
      }

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
      if (!savedGameId) {
        setSavedGameId(game.id);
      }
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
    // Auto-save before exiting - simple approach that worked before
    if (hasShotsRef.current && gameState && !gameState.isComplete) {
      await autoSaveGame(gameState);
    }
    router.push("/dashboard");
  };

  const editingFrame =
    editingFrameIndex !== null && gameState ? gameState.frames[editingFrameIndex] : null;

  if (loading || !gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-slate-900 dark:text-slate-100">Loading game...</div>
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
    <div className="flex items-center justify-between w-full">
      {/* Back button on left */}
      <button
        onClick={handleExit}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Game # in center */}
      {savedGameId && (
        <div className="text-center flex-1">
          <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Game #{savedGameId}</div>
        </div>
      )}

      {/* Score and theme switcher on right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-[var(--accent)]">{gameState.totalScore}</div>
        </div>
        <ThemeSwitcherCompact />
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
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-[100]" style={{ position: 'fixed' }}>
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md mx-4">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Game Complete!</h2>
                  <div className="text-4xl font-black text-[var(--accent)] mb-6">{gameState.totalScore}</div>
                  <button
                    type="button"
                    onClick={handleSaveGame}
                    disabled={saving}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg mb-3 disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {saving ? "Saving..." : "Save to History"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mt-2"
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

