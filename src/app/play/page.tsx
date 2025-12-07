"use client";

import { useState } from "react";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import ModernScoringBoard from "@/components/scoring/ModernScoringBoard";
import { GameState } from "@/lib/game-logic";
import Link from "next/link";
import { useScoringInterface } from "@/hooks/useScoringInterface";
import InterfaceToggle from "@/components/scoring/InterfaceToggle";

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { interfaceType, isLoaded } = useScoringInterface();

  const handleScoreUpdate = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  // Show immersive by default, or wait for localStorage to load
  const showImmersive = isLoaded ? interfaceType === "immersive" : true;

  if (showImmersive) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <ModernScoringBoard onScoreUpdate={handleScoreUpdate} />
        
        {/* Interface Toggle (floating) */}
        <div className="fixed top-4 left-4 z-20">
          <InterfaceToggle variant="dark" />
        </div>

        {/* Game Complete Overlay */}
        {gameState?.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(9, 9, 11, 0.9)" }}>
            <div className="rounded-xl p-8 max-w-md mx-4 text-center" style={{ backgroundColor: "#18181b" }}>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: "#f4f4f5" }}>Game Complete!</h2>
              <p className="text-xl mb-6" style={{ color: "#f4f4f5", opacity: 0.9 }}>
                Final Score: <span className="font-bold" style={{ color: "#22c55e" }}>{gameState.totalScore}</span>
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/signup"
                  className="px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: "#22c55e", color: "#f4f4f5" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#16a34a"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#22c55e"}
                >
                  Sign Up to Save Scores
                </Link>
                <Link
                  href="/play"
                  className="px-6 py-3 rounded-lg transition-colors"
                  style={{ backgroundColor: "#27272a", color: "#f4f4f5" }}
                  onClick={() => window.location.reload()}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3f3f46"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#27272a"}
                >
                  New Game
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Try Billiards Bowling Scoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Score a game for free! Sign up to save your scores and track your statistics.
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <InterfaceToggle />
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Sign Up to Save Scores
            </Link>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
          <ScoringBoard onScoreUpdate={handleScoreUpdate} />
          
          {gameState?.isComplete && (
            <div className="mt-8 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Game Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your final score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{gameState.totalScore}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Sign up to save this game and track your progress over time.
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

