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
    <tr className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
        {gameNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {game.gameMode}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${
            game.status === "completed" 
              ? 'bg-green-600 dark:bg-green-400' 
              : game.status === "abandoned"
              ? 'bg-slate-500 dark:bg-slate-400'
              : 'bg-[var(--accent)]'
          }`}
        >
          {game.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
        {totalScore}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {new Date(game.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-3">
          {isActive ? (
            <>
              <Link
                href={`/dashboard/games/new?gameId=${game.id}`}
                className="transition-opacity hover:opacity-80 text-green-600 dark:text-green-400 font-semibold"
              >
                Resume
              </Link>
              <button
                onClick={handleAbandon}
                disabled={abandoning}
                className="transition-opacity hover:opacity-80 text-red-600 dark:text-red-400 disabled:opacity-50"
              >
                {abandoning ? "Abandoning..." : "Abandon"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/dashboard/games/${game.id}`}
                className="transition-opacity hover:opacity-80 text-[var(--accent)]"
              >
                View
              </Link>
              {canShare && reconstructedGameState && (
                <ShareGame
                  gameState={reconstructedGameState}
                  gameId={game.id}
                  createdAt={game.createdAt instanceof Date ? game.createdAt.toISOString() : new Date(game.createdAt).toISOString()}
                  gameMode={game.gameMode}
                  compact={true}
                />
              )}
              {!isAbandoned && (
                <button
                  onClick={handleAbandon}
                  disabled={abandoning}
                  className="transition-opacity hover:opacity-80 text-red-600 dark:text-red-400 disabled:opacity-50"
                >
                  {abandoning ? "Abandoning..." : "Abandon"}
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

