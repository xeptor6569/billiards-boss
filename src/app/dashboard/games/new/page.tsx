"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import { GameState } from "@/lib/game-logic";

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleScoreUpdate = (newGameState: GameState) => {
    setGameState(newGameState);
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
      router.push(`/dashboard/games/${game.id}`);
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            New Game
          </h1>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setGameMode("single")}
              className={`px-4 py-2 rounded-md ${
                gameMode === "single"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              Single Player
            </button>
            <button
              onClick={() => setGameMode("multiplayer")}
              className={`px-4 py-2 rounded-md ${
                gameMode === "multiplayer"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              Multiplayer
            </button>
            <button
              onClick={() => setGameMode("tournament")}
              className={`px-4 py-2 rounded-md ${
                gameMode === "tournament"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              Tournament
            </button>
          </div>
        </div>

        <ScoringBoard onScoreUpdate={handleScoreUpdate} />

        {gameState?.isComplete && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleSaveGame}
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Game"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

