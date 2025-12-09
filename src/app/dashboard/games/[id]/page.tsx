"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameState, createNewGame, addBallToFrame, getRemainingBalls } from "@/lib/game-logic";
import GameLayout from "@/components/scoring/GameLayout";
import FrameRibbon from "@/components/scoring/FrameRibbon";
import RackVisualizer from "@/components/scoring/RackVisualizer";
import InputKeypad from "@/components/scoring/InputKeypad";

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

    const { getRemainingBalls, addBallToFrame } = require("@/lib/game-logic"); // Using require for now or I need to import them at top
    // Ideally importing at top is better, fixing this in next step
    const remainingBalls = getRemainingBalls(currentFrame);
    const ballsToAdd = Math.min(balls, remainingBalls);
    const newGameState = addBallToFrame(gameState, currentFrameIndex, ballsToAdd);
    setGameState(newGameState);
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
      alert("Game saved successfully!");
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

  const HeaderCmp = (
    <div className="flex justify-between items-center w-full">
      <div>
        <div className="text-[var(--game-text-secondary)] text-xs font-bold uppercase tracking-wider">Game #{game.id}</div>
        <div className="text-3xl font-black text-[var(--game-accent)]">{gameState.totalScore}</div>
      </div>
      <div className="flex gap-2">
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

  // Safe helper usage requires importing them. Code below assumes imports.
  // I will inject imports in a separate tool call to be safe or assuming I do it right after.

  return (
    <GameLayout
      header={HeaderCmp}
      frameStrip={
        <FrameRibbon
          frames={gameState.frames}
          currentFrameIndex={gameState.currentFrame - 1}
          calculateCumulativeScore={() => 0}
        />
      }
      visualizer={
        <div className="w-full h-full flex items-center justify-center">
          {/* Simplified visualizer for now or need remainingBalls logic */}
          <div className="text-[var(--game-text-secondary)]">Visualizer unavailable in edit mode yet</div>
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
          <div className="flex items-center justify-center h-full text-[var(--game-text-secondary)]">
            Editing active game... (Keypad integration pending imports)
          </div>
        )
      }
    />
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

