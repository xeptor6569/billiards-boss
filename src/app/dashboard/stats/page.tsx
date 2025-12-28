import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateUserStatistics } from "@/lib/statistics";
import StatsChart from "@/components/stats/StatsChart";
import GameTypeTabs from "@/components/history/GameTypeTabs";
import { getStandardGameTypes } from "@/lib/game-types";
import { Suspense } from "react";

interface StatsContentProps {
  gameType?: string;
}

async function StatsContent({ gameType }: StatsContentProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const stats = await calculateUserStatistics(session.user.id, gameType);
  const gameTypes = getStandardGameTypes();
  const currentGameTypeHandler = gameType ? gameTypes.find(gt => gt.metadata.id === gameType) : null;
  
  // Determine if this game type supports strikes/spares (currently only bowlliards)
  const supportsStrikesSpares = !gameType || gameType === 'bowlliards';

  if (stats.gamesPlayed === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          {gameType 
            ? `No ${currentGameTypeHandler?.metadata.name || gameType} games completed yet.`
            : "No completed games yet."
          }
        </p>
        <Link
          href="/dashboard/games/new"
          className="inline-block px-6 py-3 rounded-md transition-opacity hover:opacity-90 bg-[var(--accent)] text-white"
        >
          Start Your First Game
        </Link>
      </div>
    );
  }

  const chartData = supportsStrikesSpares ? [
    {
      name: "Games Played",
      value: stats.gamesPlayed,
    },
    {
      name: "Strikes",
      value: stats.strikes,
    },
    {
      name: "Spares",
      value: stats.spares,
    },
  ] : [
    {
      name: "Games Played",
      value: stats.gamesPlayed,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Games Played
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {stats.gamesPlayed}
          </p>
        </div>

        <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Average Score
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {stats.averageScore.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Best Score
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {stats.bestScore}
          </p>
        </div>

        {supportsStrikesSpares && (
          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Frames
            </h3>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalFrames}
            </p>
          </div>
        )}
      </div>

      {supportsStrikesSpares && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Strikes & Spares
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Strikes
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {stats.strikes} ({stats.strikePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full rounded-full h-2 bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-[var(--accent)]"
                    style={{ width: `${stats.strikePercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Spares
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {stats.spares} ({stats.sparePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full rounded-full h-2 bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-green-600 dark:bg-green-400"
                    style={{ width: `${stats.sparePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Performance Overview
            </h3>
            <StatsChart chartData={chartData} />
          </div>
        </div>
      )}

      {!supportsStrikesSpares && (
        <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Performance Overview
          </h3>
          <StatsChart chartData={chartData} />
        </div>
      )}
    </>
  );
}

export default function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ gameType?: string }>;
}) {
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
          Statistics
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Track your performance and progress over time.
        </p>
      </div>
      
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <StatsPageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function StatsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ gameType?: string }>;
}) {
  const params = await searchParams;
  const gameType = params.gameType;

  return (
    <>
      <GameTypeTabs currentGameType={gameType} basePath="/dashboard/stats" />
      <Suspense fallback={<div className="text-center py-12">Loading statistics...</div>}>
        <StatsContent gameType={gameType} />
      </Suspense>
    </>
  );
}

