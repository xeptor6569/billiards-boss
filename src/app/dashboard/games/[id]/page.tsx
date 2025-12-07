"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import { GameState, createNewGame } from "@/lib/game-logic";

export default function GameDetailPage() {
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
        if (!response.ok) {
          throw new Error("Game not found");
        }
        const gameData = await response.json();
        setGame(gameData);

        // Convert database frames to game state
        if (gameData.frames && gameData.frames.length > 0) {
          // Reconstruct game state from saved frames with full shot-by-shot data
          const { reconstructGameStateFromFrames } = await import("@/lib/game-logic");
          const state = reconstructGameStateFromFrames(gameData.frames);
          setGameState(state);
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

    if (params.id) {
      fetchGame();
    }
  }, [params.id, router]);

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
      setGame({
        ...game,
        status: updatedGame.status || game.status,
      });
      
      alert("Game saved successfully!");
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Game #{game.id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {game.gameMode} • {game.status} •{" "}
            {new Date(game.createdAt).toLocaleDateString()}
          </p>
        </div>

        {gameState && (
          <>
            <ScoringBoard
              initialGameState={gameState}
              onScoreUpdate={setGameState}
              disabled={false} // Allow editing even if completed
            />
            
            {/* Save button */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleSaveGame}
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {gameState.isComplete && game.status !== "completed" && (
                <button
                  onClick={async () => {
                    await handleSaveGame();
                    router.push("/dashboard");
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark Complete & Save
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

