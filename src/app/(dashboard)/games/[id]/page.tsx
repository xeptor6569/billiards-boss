"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import { GameState, createNewGame } from "@/lib/game-logic";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);

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
          const state = createNewGame();
          // Reconstruct game state from saved frames
          // This is simplified - you'd want to properly reconstruct the full state
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
          <ScoringBoard
            initialGameState={gameState}
            onScoreUpdate={setGameState}
            disabled={game.status === "completed"}
          />
        )}
      </div>
    </div>
  );
}

