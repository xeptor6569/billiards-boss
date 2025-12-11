"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import GameSaveSuccessModal from "@/components/scoring/GameSaveSuccessModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";
import GameSummary from "@/components/scoring/GameSummary";

function GameDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<{
    id: number;
    gameMode: string;
    status: string;
    createdAt: string;
    frames?: Array<{
      frameNumber: number;
      ballsPocketed: number[];
      score: number;
      isStrike: boolean;
      isSpare: boolean;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const autoSaveInProgressRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${params.id}`);
        if (!response.ok) throw new Error("Game not found");
        const gameData = await response.json();
        setGame(gameData);
        if (gameData.frames && gameData.frames.length > 0) {
          const { reconstructGameStateFromFrames } = await import("@/lib/game-logic");
          setGameState(reconstructGameStateFromFrames(gameData.frames));
        } else {
          setGameState(createNewGame());
        }
      } catch (error) {
        console.error("Error fetching game:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchGame();
  }, [params.id, router]);

  // Keep gameState ref updated
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Save on component unmount (backup for navigation)
  useEffect(() => {
    return () => {
      // Also save on component unmount if navigating away (only for active games)
      const currentState = gameStateRef.current;
      if (game?.status === 'active' && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        autoSaveInProgressRef.current = true;
        autoSaveGame(currentState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  // Handle game completion - mark as completed in database
  useEffect(() => {
    if (gameState?.isComplete && game?.status === 'active') {
      // Game just completed, update status to completed
      handleSaveGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.isComplete]);

  const autoSaveGame = async (stateToSave?: GameState) => {
    if (!game || game.status !== 'active') return; // Only auto-save active games
    const state = stateToSave || gameState;
    if (!state || state.isComplete || autoSaveInProgressRef.current) return;
    
    const hasProgress = state.frames.some(f => f.ballsPocketed.length > 0);
    if (!hasProgress) return;

    autoSaveInProgressRef.current = true;
    try {
      await fetch(`/api/games/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: state,
          status: "active",
        }),
      });
    } catch (error) {
      console.error("Error auto-saving game:", error);
    } finally {
      autoSaveInProgressRef.current = false;
    }
  };

  const handleScoreInput = (balls: number) => {
    if (!gameState || gameState.isComplete) return;
    const currentFrameIndex = gameState.currentFrame - 1;
    const currentFrame = gameState.frames[currentFrameIndex];
    if (!currentFrame) return;

    const remainingBalls = getRemainingBalls(currentFrame);
    const ballsToAdd = Math.min(balls, remainingBalls);
    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
    
    // Auto-save after each shot (debounced) - only for active games
    if (game?.status === 'active') {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveGame(newGameState);
      }, 1000);
    }
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
    if (!gameState || !game) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState,
          status: gameState.isComplete ? "completed" : "active",
          completedAt: gameState.isComplete ? new Date().toISOString() : null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to save game");
        return;
      }
      const updatedGame = await response.json();
      setGame({ ...game, status: updatedGame.status || game.status });
      
      // Show success modal if game is completed, otherwise just show alert
      if (gameState.isComplete) {
        setShowSuccessModal(true);
      } else {
        alert("Game saved successfully!");
      }
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !game || !gameState) return <div className="p-8 text-center">Loading...</div>;

  // If game is completed, show summary view instead of scorekeeper
  if (game.status === 'completed') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between w-full mb-6 px-4">
            {/* Back button on left */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-[var(--game-text-secondary)] hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="text-sm font-semibold">Back</span>
            </button>

            {/* Game # in center */}
            <div className="text-center flex-1">
              <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
            </div>

            {/* Theme switcher on right */}
            <div className="flex items-center gap-4">
              <ThemeSwitcherCompact />
            </div>
          </div>
          <GameSummary 
            gameState={gameState} 
            gameId={game.id} 
            createdAt={game.createdAt}
          />
        </div>
      </div>
    );
  }

  // Active game - show scorekeeper interface
  const currentFrame = gameState.frames[gameState.currentFrame - 1] || gameState.frames[9];
  const isComplete = gameState.isComplete;
  const remainingBalls = currentFrame ? getRemainingBalls(currentFrame) : 0;
  const totalPocketed = currentFrame
    ? currentFrame.ballsPocketed.reduce((sum, count) => sum + count, 0)
    : 0;
  const isTenthFrame = currentFrame?.frameNumber === 10;
  const shotCount = currentFrame?.ballsPocketed.length || 0;

  // Keypad mode logic
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

  const handleBack = async () => {
    // Auto-save before navigating back (only for active games)
    if (game?.status === 'active' && gameState && !gameState.isComplete) {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      await autoSaveGame(gameState);
    }
    router.push("/dashboard");
  };

  const HeaderCmp = (
    <div className="flex items-center justify-between w-full">
      {/* Back button on left */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[var(--game-text-secondary)] hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Game # in center */}
      <div className="text-center flex-1">
        <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
      </div>

      {/* Score and theme switcher on right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-[var(--game-accent)]">{gameState.totalScore}</div>
        </div>
        <ThemeSwitcherCompact />
      </div>
    </div>
  );

  const editingFrame =
    editingFrameIndex !== null && gameState
      ? gameState.frames[editingFrameIndex]
      : null;

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
            isEditable={!isComplete}
          />
        }
        visualizer={
          <div className="w-full h-full flex flex-col justify-center">
            <RackVisualizer totalPocketed={totalPocketed} remainingBalls={remainingBalls} />
          </div>
        }
        controls={
          isComplete ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-xl font-bold">Game Complete</div>
              <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-[var(--game-surface)] border border-[var(--game-border)] rounded-lg">
                Return to Dashboard
              </button>
            </div>
          ) : (
            <InputKeypad
              mode={keypadMode}
              remainingBalls={remainingBalls}
              onInput={handleScoreInput}
              disabled={saving}
            />
          )
        }
      />
      {editingFrameIndex !== null && editingFrame && gameState && (
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
          gameId={game?.id}
          onViewGame={() => setShowSuccessModal(false)}
          onNewGame={() => router.push("/dashboard/games/new")}
          onDashboard={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading game...</div>
      </div>
    }>
      <GameDetailContent />
    </Suspense>
  );
}

