"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";
import FrameEditModal from "@/components/scoring/FrameEditModal";
import GameSaveSuccessModal from "@/components/scoring/GameSaveSuccessModal";
import ThemeSwitcherCompact from "@/components/ThemeSwitcherCompact";

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

  const handleScoreInput = (balls: number) => {
    if (!gameState || gameState.isComplete) return;
    const currentFrameIndex = gameState.currentFrame - 1;
    const currentFrame = gameState.frames[currentFrameIndex];
    if (!currentFrame) return;

    const remainingBalls = getRemainingBalls(currentFrame);
    const ballsToAdd = Math.min(balls, remainingBalls);
    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
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

  const currentFrame = gameState.frames[gameState.currentFrame - 1] || gameState.frames[9]; // Fallback to last frame if complete?
  // If complete, currentFrame might be out of bounds if currentFrame is > 10.
  // Actually createNewGame initializes 10 frames.
  // If complete, we show 10th frame or summary.

  // Need to import helpers.
  // For now I will assume imports are present.

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

  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div>
        <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
        <div className="text-3xl font-black text-[var(--game-accent)]">{gameState.totalScore}</div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcherCompact />
        {(!isComplete || game.status !== 'completed') && (
          <button onClick={handleSaveGame} disabled={saving} className="text-sm font-bold text-[var(--game-strike)] hover:text-white px-2">
            {saving ? "SAVING..." : "SAVE"}
          </button>
        )}
        <button onClick={() => router.push("/dashboard")} className="text-sm font-bold text-[var(--game-text-secondary)] hover:text-white px-2">
          EXIT
        </button>
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

