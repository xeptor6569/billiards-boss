"use client";

import { useState } from "react";
import ModernScoringBoard from "@/components/scoring/ModernScoringBoard";
import { GameState } from "@/lib/game-logic";
import Link from "next/link";

export default function ModernPlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleScoreUpdate = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ModernScoringBoard onScoreUpdate={handleScoreUpdate} />
      
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
                href="/play/modern"
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

