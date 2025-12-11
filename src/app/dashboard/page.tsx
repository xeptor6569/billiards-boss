import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import RecentGameItem from "@/components/dashboard/RecentGameItem";
import StartNewGameButton from "@/components/dashboard/StartNewGameButton";

import { Suspense } from "react";

async function DashboardContent() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch active games and recent games with error handling
  let activeGames: Array<{
    id: number;
    userId: string;
    gameMode: string;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
  }> = [];

  let recentGames: Array<{
    id: number;
    userId: string;
    gameMode: string;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
  }> = [];

  try {
    // Ensure session.user exists before accessing id
    if (session?.user?.id) {
      // Fetch active games
      const allGames = await db.query.games.findMany({
        where: eq(games.userId, session.user.id),
        orderBy: (games, { desc }) => [desc(games.createdAt)],
      });
      
      activeGames = allGames.filter(g => g.status === "active");
      recentGames = allGames.filter(g => g.status !== "active").slice(0, 5);
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    // Continue with empty arrays - don't crash the page
    activeGames = [];
    recentGames = [];
  }

  const activeGame = activeGames.length > 0 ? activeGames[0] : null;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back, {session.user?.name || session.user?.email}!
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Start a new game or view your history and statistics.
        </p>
      </div>

      {/* Active Game Section */}
      {activeGame && (
        <div className="mb-8 p-6 rounded-lg shadow-md bg-slate-50 dark:bg-slate-800 border-2 border-[var(--accent)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
                Active Game
              </h2>
              <p className="text-sm mb-2 text-slate-600 dark:text-slate-400">
                Game #{activeGame.id} - {activeGame.gameMode}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Started {new Date(activeGame.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/games/${activeGame.id}`}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 bg-[var(--accent)]"
              >
                Resume Game
              </Link>
              <StartNewGameButton activeGameId={activeGame.id} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/games/new"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            {activeGame ? "New Game" : "New Game"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {activeGame ? "Start a fresh game (abandons current)" : "Start a new billiards bowling game"}
          </p>
        </Link>

        <Link
          href="/dashboard/history"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Game History
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            View your past games and scores
          </p>
        </Link>

        <Link
          href="/dashboard/stats"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Statistics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track your performance and progress
          </p>
        </Link>
      </div>

      {recentGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Recent Games
          </h2>
          <div className="rounded-lg shadow-md overflow-hidden bg-slate-50 dark:bg-slate-800">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentGames.map((game) => (
                <RecentGameItem key={game.id} game={game} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div className="text-center py-12">Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

