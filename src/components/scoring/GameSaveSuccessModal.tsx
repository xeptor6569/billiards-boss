"use client";

import { useRouter } from "next/navigation";

interface GameSaveSuccessModalProps {
  isOpen: boolean;
  totalScore: number;
  gameId?: number;
  onViewGame?: () => void;
  onNewGame?: () => void;
  onDashboard?: () => void;
}

export default function GameSaveSuccessModal({
  isOpen,
  totalScore,
  gameId,
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
      <div className="text-center p-6 bg-[var(--game-surface)] rounded-xl border border-[var(--game-border)] shadow-2xl max-w-md w-full mx-4">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-[var(--game-strike)]"
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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--game-text-primary)' }}>
          Game Saved!
        </h2>
        <div className="text-4xl font-black mb-6" style={{ color: 'var(--game-accent)' }}>
          {totalScore}
        </div>
        <div className="space-y-3">
          {gameId && (
            <button
              onClick={handleViewGame}
              className="w-full py-3 bg-[var(--game-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Game
            </button>
          )}
          <button
            onClick={handleNewGame}
            className="w-full py-3 bg-[var(--game-strike)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            New Game
          </button>
          <button
            onClick={handleDashboard}
            className="block w-full text-sm py-2 text-[var(--game-text-secondary)] hover:text-[var(--game-text-primary)] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

