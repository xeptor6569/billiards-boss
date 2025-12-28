import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import GameTypeCard from "@/components/dashboard/GameTypeCard";
import { getStandardGameTypes } from "@/lib/game-types";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";

import { Suspense } from "react";

async function DashboardContent() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get game types
  const gameTypes = getStandardGameTypes();
  
  // Fetch game counts per type and active game IDs
  const gameTypeStats: Record<string, { active: number; recent: number; activeGameId?: number }> = {};
  
  try {
    if (session?.user?.id) {
      for (const gameType of gameTypes) {
        const activeGames = await gamePersistenceService.listGames(session.user.id, {
          gameType: gameType.metadata.id,
          status: "active",
          limit: 100,
        });
        
        const recentGames = await gamePersistenceService.listGames(session.user.id, {
          gameType: gameType.metadata.id,
          status: "completed",
          limit: 5,
        });
        
        // Get the most recent active game ID (if any)
        const activeGameId = activeGames.length > 0 ? activeGames[0].id : undefined;
        
        gameTypeStats[gameType.metadata.id] = {
          active: activeGames.length,
          recent: recentGames.length,
          activeGameId,
        };
      }
    }
  } catch (error) {
    // Log the error but don't crash - allow dashboard to render with zero counts
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('connection') || (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED')) {
      console.error("Error fetching game stats: Database connection issue. Please ensure PostgreSQL is running and DATABASE_URL is correct.");
    } else {
      console.error("Error fetching game stats:", error);
    }
  }

  // Get user email verification status
  let user;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
  } catch (error) {
    // Handle database connection errors gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('connection') || (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED')) {
      console.error('Database connection refused. Please ensure PostgreSQL is running and DATABASE_URL is correct.');
      // Return null user - the page will handle this gracefully
      user = null;
    } else {
      throw error; // Re-throw other errors
    }
  }

  // Check if user is new (no games yet)
  const totalGames = Object.values(gameTypeStats).reduce((sum, stats) => sum + stats.active + stats.recent, 0);
  const isNewUser = totalGames === 0;

  return (
    <>
      {user && !user.emailVerified && (
        <EmailVerificationBanner email={user.email} isVerified={false} />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {isNewUser ? "Welcome to Billiards Boss!" : `Welcome back, ${session.user?.name || session.user?.email}!`}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {isNewUser 
            ? "Get started by playing your first game. Score games, save history, and track your stats."
            : "Start a new game or view your history and statistics."
          }
        </p>
      </div>

      {/* Onboarding for new users */}
      {isNewUser && (
        <div className="mb-8 p-6 rounded-lg shadow-md bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 dark:from-[var(--accent)]/20 dark:to-[var(--accent)]/10 border-2 border-[var(--accent)]/30">
          <h2 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
            🎱 Get Started in 3 Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Play your first game</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Score a full billiards bowling game</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Save and review</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">View your game history</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Track your stats</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">See your performance over time</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/games/new"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 bg-[var(--accent)] shadow-lg"
          >
            Start Your First Game →
          </Link>
        </div>
      )}

      {/* Game Types Section - Primary Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Game Types
          </h2>
          <Link
            href="/dashboard/games/new"
            className="px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 bg-[var(--accent)] text-sm"
          >
            New Game
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameTypes.map((gameType) => {
            const isComingSoon = gameType.metadata.id === 'apa8ball' || gameType.metadata.id === 'straight-pool';
            return (
              <GameTypeCard
                key={gameType.metadata.id}
                gameType={{
                  id: gameType.metadata.id,
                  name: gameType.metadata.name,
                  description: gameType.metadata.description,
                  requiresPayment: gameType.metadata.requiresPayment,
                  comingSoon: isComingSoon,
                }}
                activeGamesCount={gameTypeStats[gameType.metadata.id]?.active || 0}
                recentGamesCount={gameTypeStats[gameType.metadata.id]?.recent || 0}
                activeGameId={gameTypeStats[gameType.metadata.id]?.activeGameId}
              />
            );
          })}
          {/* Custom Game Type Card */}
          <GameTypeCard
            key="custom"
            gameType={{
              id: 'custom',
              name: 'Custom Game Type',
              description: 'Create your own custom game rules via YAML',
              requiresPayment: true,
              comingSoon: true,
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/games/new"
          className="block p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Start New Game
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Choose a game type and start scoring
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

