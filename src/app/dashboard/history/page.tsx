import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateTotalScore } from "@/lib/game-logic";
import HistoryTableRow from "@/components/history/HistoryTableRow";

import { Suspense } from "react";

async function HistoryList() {
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

  if (allGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4" style={{ color: 'var(--color-textSecondary)' }}>
          No games yet. Start your first game!
        </p>
        <Link
          href="/dashboard/games/new"
          className="inline-block px-6 py-3 rounded-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
        >
          New Game
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <table className="min-w-full divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <thead style={{ backgroundColor: 'var(--color-border)' }}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Game ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Mode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-textSecondary)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
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
              <HistoryTableRow
                key={game.id}
                game={game}
                totalScore={totalScore}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-textPrimary)' }}>
          Game History
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-textSecondary)' }}>
          View all your past games and scores.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading history...</div>}>
        <HistoryList />
      </Suspense>
    </div>
  );
}
