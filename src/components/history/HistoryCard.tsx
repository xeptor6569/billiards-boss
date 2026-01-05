"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reconstructGameStateFromFrames, GameState } from "@/lib/game-logic";
import ShareGame from "@/components/sharing/ShareGame";

interface HistoryCardProps {
  game: {
    id: number;
    gameMode: string;
    gameType?: string;
    gameTypeSequence?: number | null;
    status: string;
    createdAt: Date;
    frames?: Array<{
      frameNumber: number;
      ballsPocketed: string;
      score: number;
      isStrike: boolean;
      isSpare: boolean;
    }>;
  };
  totalScore: number;
}

export default function HistoryCard({ game, totalScore }: HistoryCardProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [abandoning, setAbandoning] = useState(false);

  // Reconstruct gameState from frames when needed for sharing
  const getGameState = (): GameState | null => {
    if (gameState) return gameState;
    
    if (!game.frames || game.frames.length === 0) return null;
    
    try {
      const parsedFrames = game.frames
        .sort((a, b) => a.frameNumber - b.frameNumber)
        .map((frame) => {
          let ballsPocketed: number[] = [];
          if (frame.ballsPocketed && typeof frame.ballsPocketed === 'string') {
            try {
              ballsPocketed = JSON.parse(frame.ballsPocketed);
            } catch {
              ballsPocketed = [];
            }
          }
          
          return {
            frameNumber: frame.frameNumber,
            ballsPocketed,
            score: frame.score,
            isStrike: frame.isStrike,
            isSpare: frame.isSpare,
            isComplete: true,
          };
        });
      
      const reconstructed = reconstructGameStateFromFrames(parsedFrames);
      setGameState(reconstructed);
      return reconstructed;
    } catch (error) {
      console.error("Error reconstructing game state:", error);
      return null;
    }
  };

  const reconstructedGameState = getGameState();
  const canShare = reconstructedGameState !== null && game.status === "completed";
  const isActive = game.status === "active";
  const isAbandoned = game.status === "abandoned";

  // Format game number: show type-specific sequence if available, otherwise use ID
  const gameNumber = game.gameTypeSequence 
    ? `${game.gameType || 'Game'} #${game.gameTypeSequence}`
    : `#${game.id}`;

  const handleAbandon = async () => {
    if (!confirm(`Are you sure you want to abandon this game? This action cannot be undone.`)) {
      return;
    }

    setAbandoning(true);
    try {
      const response = await fetch(`/api/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "abandoned",
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to abandon game");
      }
    } catch (error) {
      console.error("Error abandoning game:", error);
      alert("Failed to abandon game. Please try again.");
    } finally {
      setAbandoning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {gameNumber}
            </h3>
            <span
              className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full text-white flex-shrink-0 ${
                game.status === "completed" 
                  ? 'bg-green-600 dark:bg-green-400' 
                  : game.status === "abandoned"
                  ? 'bg-slate-500 dark:bg-slate-400'
                  : 'bg-[var(--accent)]'
              }`}
            >
              {game.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-slate-100">{totalScore}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>{game.gameMode}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>{new Date(game.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200 dark:border-slate-700">
        {isActive ? (
          <>
            <Link
              href={`/dashboard/games/new?gameId=${game.id}`}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-green-600 hover:bg-green-700 text-white"
            >
              Resume
            </Link>
            <button
              onClick={handleAbandon}
              disabled={abandoning}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {abandoning ? "Abandoning..." : "Abandon"}
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/dashboard/games/${game.id}`}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-[var(--accent)] hover:opacity-90 text-white"
            >
              View
            </Link>
            {canShare && reconstructedGameState && (
              <div>
                <ShareGame
                  gameState={reconstructedGameState}
                  gameId={game.id}
                  createdAt={game.createdAt instanceof Date ? game.createdAt.toISOString() : new Date(game.createdAt).toISOString()}
                  gameMode={game.gameMode}
                  compact={true}
                />
              </div>
            )}
            {!isAbandoned && (
              <button
                onClick={handleAbandon}
                disabled={abandoning}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {abandoning ? "Abandoning..." : "Abandon"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

