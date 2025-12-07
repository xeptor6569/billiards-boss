import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch recent games with error handling
  let recentGames = [];
  try {
    // Ensure session.user exists before accessing id
    if (session?.user?.id) {
      recentGames = await db.query.games.findMany({
        where: eq(games.userId, session.user.id),
        limit: 5,
        orderBy: (games, { desc }) => [desc(games.createdAt)],
      });
    }
  } catch (error) {
    console.error("Error fetching recent games:", error);
    // Continue with empty array - don't crash the page
    recentGames = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user?.name || session.user?.email}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Start a new game or view your history and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/games/new"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            New Game
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start a new billiards bowling game
          </p>
        </Link>

        <Link
          href="/dashboard/history"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Game History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View your past games and scores
          </p>
        </Link>

        <Link
          href="/dashboard/stats"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Statistics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your performance and progress
          </p>
        </Link>
      </div>

      {recentGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Games
          </h2>
          <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentGames.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/dashboard/games/${game.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Game #{game.id} - {game.gameMode}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {game.status}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

