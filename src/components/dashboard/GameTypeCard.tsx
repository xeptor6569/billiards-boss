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

const gameTypeIcons: Record<string, string> = {
  'apa8ball': '🎱',
  'apa9ball': '🎯',
  'bowlliards': '🎳',
  'straight-pool': '📊',
  'custom': '⚙️',
};

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

  const handleNewGameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/games/new?gameType=${gameType.id}`);
  };

  const icon = gameTypeIcons[gameType.id] || '🎮';
  
  const cardContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center text-2xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {gameType.name}
              </h3>
              {gameType.comingSoon && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white">
                  Soon
                </span>
              )}
              {gameType.requiresPayment && !gameType.comingSoon && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white">
                  Premium
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {gameType.description}
            </p>
          </div>
        </div>
      </div>
      
      {!gameType.comingSoon && (
        <>
          <div className="flex items-center gap-4 mb-4 text-sm">
            {activeGamesCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-slate-600 dark:text-slate-400">
                  {activeGamesCount} active
                </span>
              </div>
            )}
            {recentGamesCount > 0 && (
              <span className="text-slate-600 dark:text-slate-400">
                {recentGamesCount} recent
              </span>
            )}
            {activeGamesCount === 0 && recentGamesCount === 0 && (
              <span className="text-slate-500 dark:text-slate-500 italic">
                No games yet
              </span>
            )}
          </div>
          
          <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleNewGameClick}
              className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-[var(--accent)] text-white hover:opacity-90 shadow-sm"
            >
              New Game
            </button>
            <button
              type="button"
              onClick={handleHistoryClick}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              History
            </button>
            <button
              type="button"
              onClick={handleStatsClick}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              Stats
            </button>
          </div>
        </>
      )}
      
      {gameType.comingSoon && (
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center">
            Coming soon
          </p>
        </div>
      )}
    </div>
  );

  if (gameType.comingSoon) {
    return (
      <div className="block p-6 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 opacity-75 cursor-not-allowed shadow-md">
        {cardContent}
      </div>
    );
  }
  
  return (
    <Link
      href={activeGameId ? `/dashboard/games/new?gameId=${activeGameId}` : href}
      className="block p-6 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] transition-all shadow-md hover:shadow-lg h-full"
    >
      {cardContent}
    </Link>
  );
}
