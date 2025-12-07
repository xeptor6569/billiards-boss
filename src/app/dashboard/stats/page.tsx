import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateUserStatistics } from "@/lib/statistics";
import StatsChart from "@/components/stats/StatsChart";

export default async function StatsPage() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Statistics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your performance and progress over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Games Played
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.gamesPlayed}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Score
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.averageScore.toFixed(1)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Best Score
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.bestScore}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Frames
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalFrames}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Strikes & Spares
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Strikes
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.strikes} ({stats.strikePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${stats.strikePercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Spares
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.spares} ({stats.sparePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats.sparePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Overview
          </h3>
          <StatsChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
}

