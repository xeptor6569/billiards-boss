"use client";

import Link from "next/link";

interface GameTypeCardProps {
  gameType: {
    id: string;
    name: string;
    description: string;
    requiresPayment?: boolean;
  };
  recentGamesCount?: number;
  activeGamesCount?: number;
}

export default function GameTypeCard({
  gameType,
  recentGamesCount = 0,
  activeGamesCount = 0,
}: GameTypeCardProps) {
  return (
    <Link
      href={`/dashboard/history/${gameType.id}`}
      className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-all bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-[var(--accent)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {gameType.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {gameType.description}
          </p>
        </div>
        {gameType.requiresPayment && (
          <span className="px-2 py-1 text-xs font-bold rounded bg-amber-500 text-white">
            Premium
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
        {activeGamesCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {activeGamesCount} active
          </span>
        )}
        {recentGamesCount > 0 && (
          <span>{recentGamesCount} recent</span>
        )}
      </div>
    </Link>
  );
}

