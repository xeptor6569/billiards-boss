"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getStandardGameTypes } from "@/lib/game-types";

interface GameTypeTabsProps {
  currentGameType?: string;
  basePath: string;
}

export default function GameTypeTabs({ currentGameType, basePath }: GameTypeTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gameTypes = getStandardGameTypes();
  
  // Determine if we're on the base path or a specific game type
  // For stats page, check searchParams; for history, check pathname
  const isStatsPage = basePath === "/dashboard/stats";
  const isBasePath = isStatsPage 
    ? !currentGameType && !searchParams.get('gameType')
    : pathname === basePath;
  
  return (
    <div className="mb-6">
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide" aria-label="Game types">
          <Link
            href={basePath}
            className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
              isBasePath
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            All Games
          </Link>
          {gameTypes.map((gameType) => {
            const isActive = currentGameType === gameType.metadata.id;
            const isComingSoon = gameType.metadata.id === 'straight-pool';
            
            if (isComingSoon) {
              return (
                <span
                  key={gameType.metadata.id}
                  className="whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 border-transparent text-slate-400 dark:text-slate-500 text-sm cursor-not-allowed opacity-60"
                >
                  {gameType.metadata.name}
                  <span className="ml-2 text-xs">(Soon)</span>
                </span>
              );
            }
            
            const href = isStatsPage
              ? `${basePath}?gameType=${gameType.metadata.id}`
              : `${basePath}/${gameType.metadata.id}`;
            
            return (
              <Link
                key={gameType.metadata.id}
                href={href}
                className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {gameType.metadata.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

