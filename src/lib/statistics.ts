import { db } from "./db";
import { statistics, games, frames } from "./db/schema";
import { eq, and, sql } from "drizzle-orm";
import { calculateTotalScore, Frame } from "./game-logic";
import { gamePersistenceService } from "./services/game-persistence-service";

export async function calculateUserStatistics(userId: string, gameType?: string) {
  // Get or create statistics record
  const stats = await db.query.statistics.findFirst({
    where: eq(statistics.userId, userId),
  });

  // Get all completed games, optionally filtered by game type
  const whereConditions = [
    eq(games.userId, userId),
    eq(games.status, "completed"),
  ];
  
  if (gameType) {
    whereConditions.push(eq(games.gameType, gameType));
  }

  const completedGames = await db.query.games.findMany({
    where: and(...whereConditions),
    with: {
      frames: true,
    },
  });

  const gamesPlayed = completedGames.length;
  
  // Only count frames for bowlliards games (other game types don't use frames)
  const bowlliardsGames = completedGames.filter(game => game.gameType === 'bowlliards');
  const totalFrames = bowlliardsGames.reduce(
    (sum, game) => sum + game.frames.length,
    0
  );

  // Extract scores from frames for all game types
  const gameScores = completedGames.map((game) => {
    try {
      // For bowlliards, calculate from frames
      if (game.gameType === 'bowlliards' && game.frames.length > 0) {
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
        return calculateTotalScore(parsedFrames);
      } else {
        // For other game types, get score from scoreData JSON in frames
        if (game.frames.length > 0) {
          const firstFrame = game.frames[0];
          // Try to get totalScore from scoreData (unified format)
          if (firstFrame.scoreData) {
            try {
              const scoreData = JSON.parse(firstFrame.scoreData);
              return scoreData?.totalScore || firstFrame.score || 0;
            } catch {
              // If parsing fails, fallback to frame score
              return firstFrame.score || 0;
            }
          }
          // Fallback to frame score if no scoreData
          return firstFrame.score || 0;
        }
        return 0;
      }
    } catch (error) {
      // Fallback: try to sum frame scores
      console.error("Error parsing game data, using fallback:", error);
      try {
        return game.frames.reduce((sum, frame) => sum + frame.score, 0);
      } catch {
        return 0;
      }
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

  // Count strikes and spares (only for bowlliards games)
  const strikes = bowlliardsGames.reduce(
    (sum, game) => sum + game.frames.filter((f) => f.isStrike).length,
    0
  );
  const spares = bowlliardsGames.reduce(
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

