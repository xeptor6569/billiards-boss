import { db } from "./db";
import { statistics, games, frames } from "./db/schema";
import { eq, and, sql } from "drizzle-orm";
import { calculateTotalScore, Frame } from "./game-logic";

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

  // Recalculate scores dynamically from raw shot data
  const gameScores = completedGames.map((game) => {
    try {
      // Parse frames and reconstruct game state
      const parsedFrames: Frame[] = game.frames
        .sort((a, b) => a.frameNumber - b.frameNumber)
        .map((frame) => {
          const ballsPocketed = JSON.parse(frame.ballsPocketed as string) as number[];
          return {
            frameNumber: frame.frameNumber,
            ballsPocketed,
            score: frame.score,
            isStrike: frame.isStrike,
            isSpare: frame.isSpare,
            isComplete: true,
          };
        });
      
      // Calculate total score from raw shot data
      return calculateTotalScore(parsedFrames);
    } catch (error) {
      // Fallback to sum of frame scores if parsing fails (for old data)
      console.error("Error parsing frame data, using fallback:", error);
      return game.frames.reduce((sum, frame) => sum + frame.score, 0);
    }
  });

  // Calculate average score
  let averageScore = 0;
  if (gamesPlayed > 0) {
    const totalScore = gameScores.reduce((sum, score) => sum + score, 0);
    averageScore = totalScore / gamesPlayed;
  }

  // Find best score
  const bestScore = Math.max(...gameScores, 0);

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

