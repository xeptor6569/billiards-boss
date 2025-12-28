import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStandardGameTypes } from "@/lib/game-types";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";
import GameTypeTabs from "@/components/history/GameTypeTabs";
import HistoryList from "@/components/history/HistoryList";
import { Suspense } from "react";

async function AllGamesHistory() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch all games across all types
  const gameTypes = getStandardGameTypes();
  const allGames = [];
  
  for (const gameType of gameTypes) {
    try {
      const games = await gamePersistenceService.listGames(session.user.id, {
        gameType: gameType.metadata.id,
        limit: 50,
      });
      allGames.push(...games.map(game => ({
        ...game,
        gameTypeName: gameType.metadata.name,
      })));
    } catch (error) {
      console.error(`Error fetching ${gameType.metadata.id} games:`, error);
    }
  }

  // Sort by creation date, newest first
  allGames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          No games yet. Start your first game!
        </p>
        <Link
          href="/dashboard/games/new"
          className="inline-block px-6 py-3 rounded-md transition-opacity hover:opacity-90 bg-[var(--accent)] text-white"
        >
          New Game
        </Link>
      </div>
    );
  }

  return <HistoryList games={allGames} showGameType={true} />;
}

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
          <Link
            href="/dashboard"
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Game History
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          View and manage all your games.
        </p>
      </div>

      <GameTypeTabs basePath="/dashboard/history" />
      
      <Suspense fallback={<div className="text-center py-12">Loading history...</div>}>
        <AllGamesHistory />
      </Suspense>
    </div>
  );
}
