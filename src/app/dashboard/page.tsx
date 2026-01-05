import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import GameTypeCard from "@/components/dashboard/GameTypeCard";
import NewsSection from "@/components/dashboard/NewsSection";
import DevDeploymentCard from "@/components/dashboard/DevDeploymentCard";
import { getStandardGameTypes } from "@/lib/game-types";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";
import { calculateUserStatistics } from "@/lib/statistics";
import { checkGameLimit } from "@/lib/plan-checks";
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
  
  // Find the most recent active game across ALL game types
  let mostRecentActiveGame: { id: number; gameType: string; createdAt: Date } | null = null;
  let allActiveGames: Array<{ id: number; gameType: string; createdAt: Date }> = [];
  let recentCompletedGames: Array<{ id: number; gameType: string; createdAt: Date; totalScore?: number }> = [];
  
  try {
    if (session?.user?.id) {
      // First, find all active games
      const activeGamesList = await gamePersistenceService.listGames(session.user.id, {
        status: "active",
        limit: 10,
      });
      
      allActiveGames = activeGamesList.map(game => ({
        id: game.id,
        gameType: game.gameType,
        createdAt: game.createdAt,
      }));
      
      if (allActiveGames.length > 0) {
        mostRecentActiveGame = allActiveGames[0];
      }
      
      // Get recent completed games
      const completedGamesList = await gamePersistenceService.listGames(session.user.id, {
        status: "completed",
        limit: 5,
      });
      
      recentCompletedGames = completedGamesList.map(game => ({
        id: game.id,
        gameType: game.gameType,
        createdAt: game.createdAt,
        totalScore: game.gameState?.totalScore,
      }));
      
      // Then fetch stats per game type
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
        
        // Only set activeGameId if this is the most recent active game
        const activeGameId = mostRecentActiveGame && 
          mostRecentActiveGame.gameType === gameType.metadata.id 
          ? mostRecentActiveGame.id 
          : undefined;
        
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

  // Get user statistics
  let stats = null;
  let gameLimit = null;
  try {
    if (session?.user?.id) {
      stats = await calculateUserStatistics(session.user.id);
      gameLimit = await checkGameLimit(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }

  // Get user email verification status and plan
  let user;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: { plan: true },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('connection') || (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED')) {
      console.error('Database connection refused. Please ensure PostgreSQL is running and DATABASE_URL is correct.');
      user = null;
    } else {
      throw error;
    }
  }

  // Check if user is new (no games yet)
  const totalGames = Object.values(gameTypeStats).reduce((sum, stats) => sum + stats.active + stats.recent, 0);
  const isNewUser = totalGames === 0;

  // Get game type display names
  const getGameTypeName = (gameTypeId: string) => {
    const gameType = gameTypes.find(gt => gt.metadata.id === gameTypeId);
    return gameType?.metadata.name || gameTypeId;
  };

  return (
    <>
      {user && !user.emailVerified && (
        <EmailVerificationBanner email={user.email} isVerified={false} />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {isNewUser ? "Welcome to Billiards Boss!" : `Welcome back, ${session.user?.name || session.user?.email?.split('@')[0] || 'Player'}!`}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {isNewUser 
            ? "Start tracking your billiards games and improve your skills"
            : "Here's your game overview and quick actions"
          }
        </p>
      </div>

      {/* Stats Overview Cards */}
      {stats && stats.gamesPlayed > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 p-6 text-white shadow-lg">
            <div className="text-sm font-medium text-white/90 mb-1">Total Games</div>
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(stats.averageScore)}
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Best Score</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.bestScore}</div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Active Games</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {allActiveGames.length}
            </div>
          </div>
        </div>
      )}

      {/* Plan Status & Game Limit */}
      {user?.plan && (
        <div className="mb-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-[var(--accent)]/20 dark:text-[var(--accent)]">
                  {user.plan.tier === 'free' ? 'Free Plan' : 'Premium Plan'}
                </span>
                {gameLimit && (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {gameLimit.maxGames === null 
                      ? 'Unlimited games' 
                      : `${gameLimit.gamesCount || 0} / ${gameLimit.maxGames} games used`
                    }
                  </span>
                )}
              </div>
              {user.plan.tier === 'free' && gameLimit && gameLimit.maxGames !== null && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {gameLimit.gamesCount && gameLimit.gamesCount >= gameLimit.maxGames * 0.8 
                    ? `⚠️ You're running low on free games. Upgrade for unlimited games, multiplayer, tournaments, and more!`
                    : `Upgrade to unlock unlimited games, multiplayer, tournaments, custom scorekeepers, and sharing.`
                  }
                </p>
              )}
            </div>
            {user.plan.tier === 'free' && (
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-md"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Resume - Active Games */}
      {allActiveGames.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Continue Playing
            </h2>
            <Link
              href="/dashboard/history"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allActiveGames.slice(0, 3).map((game) => (
              <Link
                key={game.id}
                href={`/dashboard/games/new?gameId=${game.id}`}
                className="group rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] p-6 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">Active</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {getGameTypeName(game.gameType)}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Started {new Date(game.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center text-[var(--accent)] font-semibold group-hover:underline">
                  Resume Game →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* News/Updates Section */}
      <NewsSection />

      {/* Dev Deployment Card - Only show in development */}
      {(process.env.NODE_ENV !== "production" || 
        process.env.NEXT_PUBLIC_SHOW_DEV_CARD === "true" ||
        process.env.NEXT_PUBLIC_IS_DEV === "true" ||
        (process.env.NEXT_PUBLIC_APP_URL?.includes("dev.billiardsboss.com"))) && (
        <DevDeploymentCard userEmail={session.user?.email} />
      )}

      {/* Onboarding for new users */}
      {isNewUser && (
        <div className="mb-8 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 dark:from-[var(--accent)]/20 dark:to-[var(--accent)]/10 border-2 border-[var(--accent)]/30 p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            🎱 Get Started in 3 Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg shadow-md">
                1
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Play your first game</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose a game type and start scoring</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg shadow-md">
                2
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Save and review</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">View your game history anytime</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg shadow-md">
                3
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Track your stats</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">See your performance improve over time</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/games/new"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 bg-[var(--accent)] shadow-lg"
          >
            Start Your First Game →
          </Link>
        </div>
      )}

      {/* Game Types Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Game Types
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Choose a game type to start playing or view your history
            </p>
          </div>
          <Link
            href="/dashboard/games/new"
            className="px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-md"
          >
            + New Game
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameTypes.map((gameType) => {
            const isComingSoon = gameType.metadata.id === 'straight-pool';
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

      {/* Recent Activity */}
      {recentCompletedGames.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Recent Games
            </h2>
            <Link
              href="/dashboard/history"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentCompletedGames.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/dashboard/games/${game.id}`}
                    className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center">
                          <span className="text-xl">
                            {game.gameType === 'apa8ball' ? '🎱' : 
                             game.gameType === 'apa9ball' ? '🎯' : 
                             game.gameType === 'bowlliards' ? '🎳' : 
                             game.gameType === 'straight-pool' ? '📊' : '🎮'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {getGameTypeName(game.gameType)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(game.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      {game.totalScore !== undefined && (
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {game.totalScore}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/history"
          className="group rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md hover:shadow-lg transition-all hover:border-[var(--accent)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
              <span className="text-2xl">📜</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Game History
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                View all your completed and active games
              </p>
            </div>
            <span className="text-[var(--accent)] group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        <Link
          href="/dashboard/stats"
          className="group rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md hover:shadow-lg transition-all hover:border-[var(--accent)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Statistics
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Track your performance and progress over time
              </p>
            </div>
            <span className="text-[var(--accent)] group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
