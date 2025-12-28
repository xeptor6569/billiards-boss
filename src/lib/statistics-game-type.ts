import { gamePersistenceService } from "./services/game-persistence-service";
import { getGameType } from "./game-types";

export interface GameTypeStatistics {
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  totalScore: number;
  // Game type specific stats
  [key: string]: any;
}

/**
 * Calculate statistics for a specific game type
 * Returns null if game type doesn't support statistics yet
 */
export async function calculateGameTypeStatistics(
  userId: string,
  gameTypeId: string
): Promise<GameTypeStatistics | null> {
  const gameType = getGameType(gameTypeId);
  
  if (!gameType) {
    return null;
  }

  // Get all completed games for this type
  const games = await gamePersistenceService.listGames(userId, {
    gameType: gameTypeId,
    status: "completed",
    limit: 1000,
  });

  if (games.length === 0) {
    return {
      gamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      totalScore: 0,
    };
  }

  // Calculate basic stats from game states
  const scores = games.map((game) => game.gameState.totalScore);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / games.length;
  const bestScore = Math.max(...scores, 0);

  // For bowlliards, we can calculate strikes/spares from frames
  // For other game types, we'll need to add game-type-specific stats later
  const stats: GameTypeStatistics = {
    gamesPlayed: games.length,
    averageScore,
    bestScore,
    totalScore,
  };

  // Add game-type-specific statistics
  if (gameTypeId === 'bowlliards') {
    // For bowlliards, we can get frames data
    // This would require fetching frames separately or including them in the game state
    // For now, we'll just return basic stats
  } else if (gameTypeId === 'apa9ball') {
    // APA 9-ball specific stats could go here
    // e.g., match points, innings, etc.
  }

  return stats;
}

/**
 * Calculate aggregate statistics across all game types
 */
export async function calculateAllGamesStatistics(
  userId: string
): Promise<{
  totalGames: number;
  byGameType: Record<string, GameTypeStatistics | null>;
}> {
  const { getStandardGameTypes } = await import("./game-types");
  const gameTypes = getStandardGameTypes();

  const byGameType: Record<string, GameTypeStatistics | null> = {};
  let totalGames = 0;

  for (const gameType of gameTypes) {
    const stats = await calculateGameTypeStatistics(userId, gameType.metadata.id);
    byGameType[gameType.metadata.id] = stats;
    if (stats) {
      totalGames += stats.gamesPlayed;
    }
  }

  return {
    totalGames,
    byGameType,
  };
}

