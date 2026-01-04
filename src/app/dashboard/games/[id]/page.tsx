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
import { BaseGameState, getGameType } from "@/lib/game-types";

function GameDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<{
    id: number;
    gameMode: string;
    gameType?: string;
    status: string;
    createdAt: string;
    frames?: Array<{
      frameNumber: number;
      ballsPocketed: number[];
      score: number;
      isStrike: boolean;
      isSpare: boolean;
    }>;
    gameState?: BaseGameState;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [baseGameState, setBaseGameState] = useState<BaseGameState | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const autoSaveInProgressRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const gameRef = useRef<typeof game>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${params.id}`);
        if (!response.ok) throw new Error("Game not found");
        const gameData = await response.json();
        setGame(gameData);
        
        const gameType = gameData.gameType || 'bowlliards';
        
        // Handle different game types
        if (gameType === 'bowlliards') {
          // Bowlliards: reconstruct from frames
          if (gameData.frames && gameData.frames.length > 0) {
            const { reconstructGameStateFromFrames } = await import("@/lib/game-logic");
            setGameState(reconstructGameStateFromFrames(gameData.frames));
          } else {
            setGameState(createNewGame());
          }
        } else {
          // Other game types: use gameState from API
          if (gameData.gameState) {
            const gameTypeHandler = getGameType(gameType);
            if (gameTypeHandler) {
              const reconstructed = gameTypeHandler.reconstructFromData(gameData.gameState);
              setBaseGameState(reconstructed);
            }
          } else {
            // Create new game of this type
            const gameTypeHandler = getGameType(gameType);
            if (gameTypeHandler) {
              const newState = gameTypeHandler.createNewGame();
              setBaseGameState(newState);
            }
          }
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

  // Keep refs updated
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Save on component unmount (backup for navigation)
  useEffect(() => {
    return () => {
      // Also save on component unmount if navigating away (only for active games)
      const currentGame = gameRef.current;
      const currentState = gameStateRef.current;
      const gameId = params.id;
      if (currentGame?.status === 'active' && currentState && !currentState.isComplete && !autoSaveInProgressRef.current) {
        console.log("Unmount: Triggering auto-save", { gameId });
        autoSaveInProgressRef.current = true;
        // Use keepalive for unmount saves
        fetch(`/api/games/${gameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: currentState,
            status: "active",
          }),
          keepalive: true,
        }).catch(err => console.error("Unmount save error:", err));
      }
    };
  }, [params.id]);

  // Handle game completion - mark as completed in database
  useEffect(() => {
    if (gameState?.isComplete && game?.status === 'active') {
      // Game just completed, update status to completed
      handleSaveGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.isComplete]);

  const autoSaveGame = async (stateToSave?: GameState, skipProgressCheck = false, skipStatusCheck = false) => {
    // Use refs to get latest values
    const currentGame = gameRef.current || game;
    if (!skipStatusCheck && (!currentGame || currentGame.status !== 'active')) {
      console.log("Auto-save skipped: game not active", { gameId: params.id, status: currentGame?.status, hasGame: !!currentGame });
      return; // Only auto-save active games
    }
    
    const state = stateToSave || gameStateRef.current || gameState;
    if (!state || state.isComplete || autoSaveInProgressRef.current) {
      console.log("Auto-save skipped: state check failed", { 
        hasState: !!state, 
        isComplete: state?.isComplete, 
        inProgress: autoSaveInProgressRef.current 
      });
      return;
    }
    
    if (!skipProgressCheck) {
      const hasProgress = state.frames.some(f => f.ballsPocketed.length > 0);
      if (!hasProgress) {
        console.log("Auto-save skipped: no progress");
        return;
      }
    }

    autoSaveInProgressRef.current = true;
    try {
      console.log("Auto-saving game", { gameId: params.id, skipStatusCheck, skipProgressCheck });
      const response = await fetch(`/api/games/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: state,
          status: "active",
        }),
      });
      if (response.ok) {
        console.log("Auto-save successful", { gameId: params.id });
      } else {
        const errorText = await response.text();
        console.error("Auto-save failed", { gameId: params.id, status: response.status, error: errorText });
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

  const gameType = game?.gameType || 'bowlliards';
  const hasGameState = gameType === 'bowlliards' ? !!gameState : !!baseGameState;
  
  if (loading || !game || !hasGameState) return <div className="p-8 text-center">Loading...</div>;

  // If game is completed, show summary view instead of scorekeeper
  if (game.status === 'completed') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between w-full mb-6 px-4">
            {/* Back button on left */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="text-sm font-semibold">Back</span>
            </button>

            {/* Game # in center */}
            <div className="text-center flex-1">
              <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
            </div>

            {/* Theme switcher on right */}
            <div className="flex items-center gap-4">
              <ThemeSwitcherCompact />
            </div>
          </div>
          <GameSummary 
            gameState={gameType === 'bowlliards' ? gameState! : null}
            baseGameState={gameType !== 'bowlliards' ? baseGameState! : null}
            gameType={gameType}
            gameId={game.id} 
            createdAt={game.createdAt}
            gameMode={game.gameMode}
          />
        </div>
      </div>
    );
  }

  // Active game - show scorekeeper interface
  // Only bowliards games use the active game interface (gameState)
  // Other game types should be handled in the new game page
  if (gameType !== 'bowlliards' || !gameState) {
    // Redirect non-bowliards active games to new game page
    router.push(`/dashboard/games/new?gameId=${game.id}`);
    return <div className="p-8 text-center">Redirecting...</div>;
  }

  // TypeScript now knows gameState exists and is for bowliards
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
    // Use refs to get latest values in case state hasn't updated
    const currentGame = gameRef.current || game;
    const currentState = gameStateRef.current || gameState;
    
    console.log("handleBack called", { 
      gameId: params.id,
      hasGame: !!currentGame,
      gameStatus: currentGame?.status,
      hasState: !!currentState,
      isComplete: currentState?.isComplete,
      hasProgress: currentState?.frames.some(f => f.ballsPocketed.length > 0)
    });
    
    if (currentState && !currentState.isComplete) {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      console.log("handleBack: Triggering auto-save before navigation", { 
        gameId: params.id, 
        gameStatus: currentGame?.status,
        hasProgress: currentState.frames.some(f => f.ballsPocketed.length > 0)
      });
      // Skip both progress and status checks since we're explicitly saving on exit
      // The game might not have status set yet if it was just created
      await autoSaveGame(currentState, true, true);
      // Small delay to ensure save completes
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.log("handleBack: Skipping save", { 
        hasState: !!currentState, 
        isComplete: currentState?.isComplete 
      });
    }
    router.push("/dashboard");
  };

  const HeaderCmp = (
    <div className="flex items-center justify-between w-full">
      {/* Back button on left */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Game # in center */}
      <div className="text-center flex-1">
        <div className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
      </div>

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
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">Game Complete</div>
              <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
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
      {gameState && game && (
        <GameSaveSuccessModal
          isOpen={showSuccessModal}
          totalScore={gameState.totalScore}
          gameId={game.id}
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

