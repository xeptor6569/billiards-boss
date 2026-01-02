"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface GameTypeCardProps {
  gameType: {
    id: string;
    name: string;
    description: string;
    requiresPayment?: boolean;
    comingSoon?: boolean;
  };
  recentGamesCount?: number;
  activeGamesCount?: number;
  activeGameId?: number;
}

export default function GameTypeCard({
  gameType,
  recentGamesCount = 0,
  activeGamesCount = 0,
  activeGameId,
}: GameTypeCardProps) {
  const router = useRouter();
  
  // If there's an active game, link to resume it via new game page, otherwise link to history
  const href = activeGameId 
    ? `/dashboard/games/new?gameId=${activeGameId}`
    : `/dashboard/history/${gameType.id}`;
  
  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/history/${gameType.id}`);
  };

  const handleStatsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/stats?gameType=${gameType.id}`);
  };
  
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {gameType.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {gameType.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {gameType.comingSoon && (
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500 text-white">
              Coming Soon
            </span>
          )}
          {gameType.requiresPayment && !gameType.comingSoon && (
            <span className="px-2 py-1 text-xs font-bold rounded bg-amber-500 text-white">
              Premium
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {!gameType.comingSoon && activeGamesCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {activeGamesCount} active {activeGameId && "(Click to resume)"}
            </span>
          )}
          {!gameType.comingSoon && recentGamesCount > 0 && (
            <span>{recentGamesCount} recent</span>
          )}
        </div>
        {!gameType.comingSoon && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHistoryClick}
              className="px-2 py-1 text-xs font-medium rounded transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              History
            </button>
            <button
              type="button"
              onClick={handleStatsClick}
              className="px-2 py-1 text-xs font-medium rounded transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Stats
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (gameType.comingSoon) {
    return (
      <div className="block p-6 rounded-lg shadow-md bg-slate-50 dark:bg-slate-800 border-2 border-transparent opacity-75 cursor-not-allowed">
        {cardContent}
      </div>
    );
  }
  
  return (
    <Link
      href={href}
      className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-all bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-[var(--accent)]"
    >
      {cardContent}
    </Link>
  );
}

