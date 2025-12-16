"use client";

import { useRouter } from "next/navigation";
import { GameState } from "@/lib/game-logic";
import ShareGame from "@/components/sharing/ShareGame";

interface GameSaveSuccessModalProps {
  isOpen: boolean;
  totalScore: number;
  gameId?: number;
  gameState?: GameState;
  createdAt?: string;
  gameMode?: string;
  onViewGame?: () => void;
  onNewGame?: () => void;
  onDashboard?: () => void;
}

export default function GameSaveSuccessModal({
  isOpen,
  totalScore,
  gameId,
  gameState,
  createdAt,
  gameMode,
  onViewGame,
  onNewGame,
  onDashboard,
}: GameSaveSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleViewGame = () => {
    if (onViewGame) {
      onViewGame();
    } else if (gameId) {
      router.push(`/dashboard/games/${gameId}`);
    }
  };

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    } else {
      router.push("/dashboard/games/new");
    }
  };

  const handleDashboard = () => {
    if (onDashboard) {
      onDashboard();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full mx-4">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
          Game Saved!
        </h2>
        <div className="text-4xl font-black mb-6 text-[var(--accent)]">
          {totalScore}
        </div>
        <div className="space-y-3">
          {gameId && gameState && createdAt && (
            <div className="mb-3">
              <ShareGame
                gameState={gameState}
                gameId={gameId}
                createdAt={createdAt}
                gameMode={gameMode}
              />
            </div>
          )}
          {gameId && (
            <button
              onClick={handleViewGame}
              className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Game
            </button>
          )}
          <button
            onClick={handleNewGame}
            className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            New Game
          </button>
          <button
            onClick={handleDashboard}
            className="block w-full text-sm py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

