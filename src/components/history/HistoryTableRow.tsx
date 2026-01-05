"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reconstructGameStateFromFrames, GameState } from "@/lib/game-logic";
import ShareGame from "@/components/sharing/ShareGame";

interface HistoryTableRowProps {
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

export default function HistoryTableRow({ game, totalScore }: HistoryTableRowProps) {
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
          // Handle null or missing ballsPocketed
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
        // Refresh the page to update the list
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
    <div className="flex items-center gap-2 flex-wrap">
      {isActive ? (
        <>
          <Link
            href={`/dashboard/games/new?gameId=${game.id}`}
            className="px-2 py-1 text-xs sm:text-sm transition-opacity hover:opacity-80 text-green-600 dark:text-green-400 font-semibold whitespace-nowrap"
          >
            Resume
          </Link>
          <button
            onClick={handleAbandon}
            disabled={abandoning}
            className="px-2 py-1 text-xs sm:text-sm transition-opacity hover:opacity-80 text-red-600 dark:text-red-400 disabled:opacity-50 whitespace-nowrap"
          >
            {abandoning ? "Abandoning..." : "Abandon"}
          </button>
        </>
      ) : (
        <>
          <Link
            href={`/dashboard/games/${game.id}`}
            className="px-2 py-1 text-xs sm:text-sm transition-opacity hover:opacity-80 text-[var(--accent)] whitespace-nowrap"
          >
            View
          </Link>
          {canShare && reconstructedGameState && (
            <div className="whitespace-nowrap">
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
              className="px-2 py-1 text-xs sm:text-sm transition-opacity hover:opacity-80 text-red-600 dark:text-red-400 disabled:opacity-50 whitespace-nowrap"
            >
              {abandoning ? "Abandoning..." : "Abandon"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

