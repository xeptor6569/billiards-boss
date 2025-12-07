"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import ModernScoringBoard from "@/components/scoring/ModernScoringBoard";
import { GameState } from "@/lib/game-logic";
import { useScoringInterface } from "@/hooks/useScoringInterface";
import InterfaceToggle from "@/components/scoring/InterfaceToggle";

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<"single" | "multiplayer" | "tournament">("single");
  const [saving, setSaving] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { interfaceType, isLoaded } = useScoringInterface();

  const handleScoreUpdate = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  // Use interfaceType directly to ensure reactivity
  const showImmersive = !isLoaded || interfaceType === "immersive";

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

  if (showImmersive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                New Game
              </h1>
              <InterfaceToggle variant="light" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGameMode("single")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  gameMode === "single"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setGameMode("multiplayer")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  gameMode === "multiplayer"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Multi
              </button>
              <button
                onClick={() => setGameMode("tournament")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  gameMode === "tournament"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Tournament
              </button>
            </div>
          </div>

          {/* Modern Scoring Board - Contained */}
          <div className="max-w-4xl mx-auto">
            <div className="h-[80vh] min-h-[600px] max-h-[900px]">
              <ModernScoringBoard onScoreUpdate={handleScoreUpdate} />
            </div>
          </div>

          {/* Save Game Button */}
          {gameState?.isComplete && (
            <div className="max-w-4xl mx-auto mt-6 flex gap-3 justify-center">
              <button
                onClick={handleSaveGame}
                disabled={saving}
                className="px-6 py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#f4f4f5",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.backgroundColor = "#16a34a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#22c55e";
                }}
              >
                {saving ? "Saving..." : "Save Game"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: "#27272a",
                  color: "#f4f4f5",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3f3f46"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#27272a"}
              >
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              New Game
            </h1>
            <InterfaceToggle />
          </div>
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

