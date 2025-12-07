import { db } from "./db";
import { statistics, games, frames } from "./db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function calculateUserStatistics(userId: string) {
  // Get or create statistics record
  let stats = await db.query.statistics.findFirst({
    where: eq(statistics.userId, userId),
  });

  // Get all completed games
  const completedGames = await db.query.games.findMany({
    where: and(eq(games.userId, userId), eq(games.status, "completed")),
    with: {
      frames: true,
    },
  });

  const gamesPlayed = completedGames.length;
  const totalFrames = completedGames.reduce(
    (sum, game) => sum + game.frames.length,
    0
  );

  // Calculate average score
  let averageScore = 0;
  if (totalFrames > 0) {
    const totalScore = completedGames.reduce((sum, game) => {
      return sum + game.frames.reduce((frameSum, frame) => frameSum + frame.score, 0);
    }, 0);
    averageScore = totalScore / gamesPlayed;
  }

  // Find best score
  const bestScore = Math.max(
    ...completedGames.map((game) =>
      game.frames.reduce((sum, frame) => sum + frame.score, 0)
    ),
    0
  );

  // Count strikes and spares
  const strikes = completedGames.reduce(
    (sum, game) => sum + game.frames.filter((f) => f.isStrike).length,
    0
  );
  const spares = completedGames.reduce(
    (sum, game) => sum + game.frames.filter((f) => f.isSpare).length,
    0
  );

  // Update or create statistics
  if (stats) {
    await db
      .update(statistics)
      .set({
        gamesPlayed,
        totalFrames,
        averageScore: averageScore.toString(),
        bestScore,
        strikes,
        spares,
        updatedAt: new Date(),
      })
      .where(eq(statistics.userId, userId));
  } else {
    await db.insert(statistics).values({
      userId,
      gamesPlayed,
      totalFrames,
      averageScore: averageScore.toString(),
      bestScore,
      strikes,
      spares,
    });
  }

  return {
    gamesPlayed,
    totalFrames,
    averageScore,
    bestScore,
    strikes,
    spares,
    strikePercentage: totalFrames > 0 ? (strikes / totalFrames) * 100 : 0,
    sparePercentage: totalFrames > 0 ? (spares / totalFrames) * 100 : 0,
  };
}

