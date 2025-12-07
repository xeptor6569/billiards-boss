import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateTotalScore } from "@/lib/game-logic";

export default async function HistoryPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const allGames = await db.query.games.findMany({
    where: eq(games.userId, session.user.id),
    orderBy: (games, { desc }) => [desc(games.createdAt)],
    with: {
      frames: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Game History
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View all your past games and scores.
        </p>
      </div>

      {allGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No games yet. Start your first game!
          </p>
          <Link
            href="/dashboard/games/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            New Game
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Game ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {allGames.map((game) => {
                // Recalculate score from raw shot data
                let totalScore = 0;
                if (game.frames && game.frames.length > 0) {
                  try {
                    // Parse frames and reconstruct game state
                    const parsedFrames = game.frames
                      .sort((a, b) => a.frameNumber - b.frameNumber)
                      .map((frame) => ({
                        frameNumber: frame.frameNumber,
                        ballsPocketed: JSON.parse(frame.ballsPocketed as string) as number[],
                        score: frame.score,
                        isStrike: frame.isStrike,
                        isSpare: frame.isSpare,
                        isComplete: true,
                      }));
                    totalScore = calculateTotalScore(parsedFrames);
                  } catch {
                    // Fallback to sum of frame scores if parsing fails
                    totalScore = game.frames.reduce((sum, frame) => sum + frame.score, 0);
                  }
                }
                return (
                  <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{game.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {game.gameMode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          game.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {totalScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/games/${game.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

