import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";
import { getGameType } from "@/lib/game-types";
import HistoryList from "@/components/history/HistoryList";
import GameTypeTabs from "@/components/history/GameTypeTabs";
import { Suspense } from "react";

interface HistoryListContentProps {
  gameType: string;
}

async function HistoryListContent({ gameType }: HistoryListContentProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Validate game type
  const gameTypeHandler = getGameType(gameType);
  if (!gameTypeHandler) {
    return (
      <div className="text-center py-12">
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          Invalid game type: {gameType}
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 rounded-md transition-opacity hover:opacity-90 bg-[var(--accent)] text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch games for this type
  const games = await gamePersistenceService.listGames(session.user.id, {
    gameType,
    limit: 100,
  });

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          No {gameTypeHandler.metadata.name} games yet. Start your first game!
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

  return <HistoryList games={games} gameTypeName={gameTypeHandler.metadata.name} />;
}

export default function GameTypeHistoryPage({
  params,
}: {
  params: Promise<{ gameType: string }>;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div className="text-center py-12">Loading history...</div>}>
        <GameTypeHistoryContent params={params} />
      </Suspense>
    </div>
  );
}

async function GameTypeHistoryContent({
  params,
}: {
  params: Promise<{ gameType: string }>;
}) {
  const { gameType } = await params;
  const gameTypeHandler = getGameType(gameType);

  if (!gameTypeHandler) {
    redirect("/dashboard");
  }

  return (
    <>
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

      <GameTypeTabs currentGameType={gameType} basePath="/dashboard/history" />
      
      <Suspense fallback={<div className="text-center py-12">Loading history...</div>}>
        <HistoryListContent gameType={gameType} />
      </Suspense>
    </>
  );
}

