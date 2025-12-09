import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateUserStatistics } from "@/lib/statistics";
import StatsChart from "@/components/stats/StatsChart";

import { Suspense } from "react";

async function StatsContent() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const stats = await calculateUserStatistics(session.user.id);

  const chartData = [
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
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
            Games Played
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
            {stats.gamesPlayed}
          </p>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
            Average Score
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
            {stats.averageScore.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
            Best Score
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
            {stats.bestScore}
          </p>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
            Total Frames
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
            {stats.totalFrames}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-textPrimary)' }}>
            Strikes & Spares
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Strikes
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                  {stats.strikes} ({stats.strikePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${stats.strikePercentage}%`, backgroundColor: 'var(--color-accent)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Spares
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                  {stats.spares} ({stats.sparePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${stats.sparePercentage}%`, backgroundColor: 'var(--color-success)' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-textPrimary)' }}>
            Performance Overview
          </h3>
          <StatsChart chartData={chartData} />
        </div>
      </div>
    </>
  );
}

export default function StatsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
          Statistics
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-textSecondary)' }}>
          Track your performance and progress over time.
        </p>
      </div>
      <Suspense fallback={<div className="text-center py-12">Loading statistics...</div>}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

