"use client";

import { useState } from "react";
import ScoringBoard from "@/components/scoring/ScoringBoard";
import { GameState } from "@/lib/game-logic";
import Link from "next/link";

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleScoreUpdate = (newGameState: GameState) => {
    setGameState(newGameState);
  };

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
          <div className="flex justify-center gap-4">
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

