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

  // Fetch all games for the user (including those without frames)
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
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          No games yet. Start your first game!
        </p>
        <Link
          href="/dashboard/games/new"
          className="inline-block px-6 py-3 rounded-md transition-opacity hover:opacity-90 bg-[var(--accent)] text-white"
        >
          New Game
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md overflow-hidden bg-slate-50 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Game ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Mode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {allGames.map((game) => {
            // Recalculate score from raw shot data
            let totalScore = 0;
            if (game.frames && game.frames.length > 0) {
              try {
                // Check if this is a Bowlliards game (has ballsPocketed) or other game type (has scoreData)
                const firstFrame = game.frames[0];
                
                // For Bowlliards games, parse ballsPocketed
                if (firstFrame.ballsPocketed && typeof firstFrame.ballsPocketed === 'string') {
                  const parsedFrames = game.frames
                    .sort((a, b) => a.frameNumber - b.frameNumber)
                    .map((frame) => {
                      // Handle null or empty ballsPocketed
                      let ballsPocketed: number[] = [];
                      if (frame.ballsPocketed && typeof frame.ballsPocketed === 'string') {
                        try {
                          ballsPocketed = JSON.parse(frame.ballsPocketed);
                        } catch {
                          ballsPocketed = [];
                        }
                      }
                      
                      return {
                        frameNumber: frame.frameNumber,
                        ballsPocketed,
                        score: frame.score,
                        isStrike: frame.isStrike,
                        isSpare: frame.isSpare,
                        isComplete: true,
                      };
                    });
                  totalScore = calculateTotalScore(parsedFrames);
                } 
                // For other game types, try to get score from scoreData or sum frame scores
                else if (firstFrame.scoreData && typeof firstFrame.scoreData === 'string') {
                  try {
                    const scoreData = JSON.parse(firstFrame.scoreData);
                    totalScore = scoreData.totalScore || 0;
                  } catch {
                    // Fallback to sum of frame scores
                    totalScore = game.frames.reduce((sum, frame) => sum + frame.score, 0);
                  }
                } 
                // Fallback: sum of frame scores
                else {
                  totalScore = game.frames.reduce((sum, frame) => sum + frame.score, 0);
                }
              } catch (error) {
                // Fallback to sum of frame scores if parsing fails
                console.error(`Error calculating score for game ${game.id}:`, error);
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Game History
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          View all your past games and scores.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading history...</div>}>
        <HistoryList />
      </Suspense>
    </div>
  );
}
