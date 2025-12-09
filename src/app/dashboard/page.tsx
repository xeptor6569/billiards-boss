import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import RecentGameItem from "@/components/dashboard/RecentGameItem";

import { Suspense } from "react";

async function DashboardContent() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch recent games with error handling
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
          Welcome back, {session.user?.name || session.user?.email}!
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-textSecondary)' }}>
          Start a new game or view your history and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/games/new"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
            New Game
          </h2>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            Start a new billiards bowling game
          </p>
        </Link>

        <Link
          href="/dashboard/history"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
            Game History
          </h2>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            View your past games and scores
          </p>
        </Link>

        <Link
          href="/dashboard/stats"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
            Statistics
          </h2>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            Track your performance and progress
          </p>
        </Link>
      </div>

      {recentGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-textPrimary)' }}>
            Recent Games
          </h2>
          <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
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

