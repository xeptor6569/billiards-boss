import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";
import { getGameType } from "@/lib/game-types";
import HistoryTableRow from "@/components/history/HistoryTableRow";
import HistoryCard from "@/components/history/HistoryCard";
import { Suspense } from "react";

interface HistoryListProps {
  gameType: string;
}

async function HistoryList({ gameType }: HistoryListProps) {
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

  // Prepare game data
  const gameData = games.map((game) => {
    const totalScore = game.gameState.totalScore;
    const isActuallyComplete = game.gameState.isComplete || game.status === 'completed';
    const effectiveStatus = isActuallyComplete ? 'completed' : game.status;
    return {
      game: {
        id: game.id,
        gameMode: game.gameMode,
        gameType: game.gameType,
        gameTypeSequence: game.gameTypeSequence,
        status: effectiveStatus,
        createdAt: game.createdAt,
        frames: [], // Not needed for display
      },
      totalScore,
    };
  });

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {gameData.map(({ game, totalScore }) => (
          <HistoryCard
            key={game.id}
            game={game}
            totalScore={totalScore}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg shadow-md overflow-hidden bg-slate-50 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Game #
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  Mode
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Score
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {gameData.map(({ game, totalScore }) => (
                <HistoryTableRow
                  key={game.id}
                  game={game}
                  totalScore={totalScore}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
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
          {gameTypeHandler.metadata.name} History
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          View all your {gameTypeHandler.metadata.name} games and scores.
        </p>
      </div>

      <HistoryList gameType={gameType} />
    </>
  );
}

