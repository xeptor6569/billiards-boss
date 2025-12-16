"use client";

import { useState } from "react";
import Link from "next/link";
import { reconstructGameStateFromFrames, GameState } from "@/lib/game-logic";
import ShareGame from "@/components/sharing/ShareGame";

interface HistoryTableRowProps {
  game: {
    id: number;
    gameMode: string;
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
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Reconstruct gameState from frames when needed for sharing
  const getGameState = (): GameState | null => {
    if (gameState) return gameState;
    
    if (!game.frames || game.frames.length === 0) return null;
    
    try {
      const parsedFrames = game.frames
        .sort((a, b) => a.frameNumber - b.frameNumber)
        .map((frame) => ({
          frameNumber: frame.frameNumber,
          ballsPocketed: JSON.parse(frame.ballsPocketed as string) as number[],
          score: frame.score,
          isStrike: frame.isStrike,
          isSpare: frame.isSpare,
          isComplete: true,
        }));
      
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

  return (
    <tr className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
        #{game.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {game.gameMode}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${
            game.status === "completed" 
              ? 'bg-green-600 dark:bg-green-400' 
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
        </div>
      </td>
    </tr>
  );
}

