/**
 * Game Persistence Service
 * 
 * Abstracts all database operations for games, providing a unified interface
 * that works for all game types. Game types are storage-agnostic and only
 * need to implement serialization/deserialization.
 */

import { db } from "@/lib/db";
import { games, frames } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { BaseGameState } from "@/lib/game-types/types";
import { getGameType } from "@/lib/game-types";
import { sql } from "drizzle-orm";

export interface CreateGameParams {
  userId: string;
  gameMode: "single" | "multiplayer" | "tournament";
  gameType: string;
  customGameId?: number | null;
  gameState: BaseGameState;
}

export interface GameWithState {
  id: number;
  userId: string;
  gameMode: string;
  gameType: string;
  gameTypeSequence: number | null;
  customGameId: number | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  gameState: BaseGameState;
}

export class GamePersistenceService {
  /**
   * Get the next sequence number for a game type for a specific user
   */
  private async getNextSequence(userId: string, gameType: string): Promise<number> {
    const result = await db
      .select({ maxSeq: sql<number>`COALESCE(MAX(${games.gameTypeSequence}), 0)` })
      .from(games)
      .where(
        and(
          eq(games.userId, userId),
          eq(games.gameType, gameType)
        )
      );

    return (result[0]?.maxSeq || 0) + 1;
  }

  /**
   * Create a new game and save its state
   */
  async createGame(params: CreateGameParams): Promise<GameWithState> {
    const { userId, gameMode, gameType, customGameId, gameState } = params;

    // Get next sequence number
    const sequence = await this.getNextSequence(userId, gameType);

    // Create game record
    const [newGame] = await db
      .insert(games)
      .values({
        userId,
        gameMode,
        gameType,
        gameTypeSequence: sequence,
        customGameId: customGameId || null,
        status: gameState.isComplete ? "completed" : "active",
        completedAt: gameState.isComplete ? new Date() : null,
      })
      .returning();

    // Save game state
    await this.saveGameState(newGame.id, gameState);

    return {
      ...newGame,
      gameState,
    };
  }

  /**
   * Save game state to database
   */
  async saveGameState(gameId: number, gameState: BaseGameState): Promise<void> {
    const gameTypeHandler = getGameType(gameState.gameType);
    if (!gameTypeHandler) {
      throw new Error(`Unknown game type: ${gameState.gameType}`);
    }

    // Serialize game state using game type handler
    const serialized = gameTypeHandler.serialize(gameState);

    // Delete existing frames
    await db.delete(frames).where(eq(frames.gameId, gameId));

    // Insert unified scoreData
    await db.insert(frames).values({
      gameId,
      frameNumber: 1, // Always use 1 for unified storage
      score: serialized.totalScore || 0,
      isStrike: false, // Legacy field, not used for new games
      isSpare: false, // Legacy field, not used for new games
      scoreData: JSON.stringify(serialized),
      ballsPocketed: null, // Legacy field, not used for new games
    });
  }

  /**
   * Load a game by ID with its state reconstructed
   */
  async loadGame(gameId: number, userId: string): Promise<GameWithState | null> {
    const game = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.userId, userId)),
      with: {
        frames: true,
      },
    });

    if (!game) {
      return null;
    }

    // Reconstruct game state
    const gameState = await this.reconstructGameState(game);

    return {
      id: game.id,
      userId: game.userId,
      gameMode: game.gameMode,
      gameType: game.gameType,
      gameTypeSequence: game.gameTypeSequence,
      customGameId: game.customGameId,
      status: game.status,
      createdAt: game.createdAt,
      completedAt: game.completedAt,
      gameState,
    };
  }

  /**
   * Reconstruct game state from database record
   */
  private async reconstructGameState(game: {
    gameType: string;
    frames: Array<{
      scoreData: string | null;
      ballsPocketed: string | null;
      [key: string]: unknown;
    }>;
  }): Promise<BaseGameState> {
    const gameTypeHandler = getGameType(game.gameType);
    if (!gameTypeHandler) {
      throw new Error(`Unknown game type: ${game.gameType}`);
    }

    const firstFrame = game.frames[0];

    // Try to load from scoreData (unified format)
    if (firstFrame?.scoreData) {
      try {
        const scoreData = JSON.parse(firstFrame.scoreData);
        return gameTypeHandler.reconstructFromData(scoreData);
      } catch (error) {
        console.error("Error parsing scoreData:", error);
        // Fall through to legacy format
      }
    }

    // Legacy format: Bowlliards with frames
    if (game.gameType === "bowlliards" && game.frames.length > 0) {
      const parsedFrames = game.frames
        .sort((a, b) => (a.frameNumber as number) - (b.frameNumber as number))
        .map((frame) => {
          let ballsPocketed: number[] = [];
          if (frame.ballsPocketed) {
            try {
              ballsPocketed = typeof frame.ballsPocketed === "string"
                ? JSON.parse(frame.ballsPocketed)
                : (frame.ballsPocketed as number[]);
            } catch {
              ballsPocketed = [];
            }
          }

          return {
            frameNumber: frame.frameNumber as number,
            ballsPocketed,
            score: frame.score as number,
            isStrike: frame.isStrike as boolean,
            isSpare: frame.isSpare as boolean,
            isComplete: true,
          };
        });

      return gameTypeHandler.reconstructFromData({ frames: parsedFrames });
    }

    // Fallback: create new game
    return gameTypeHandler.createNewGame();
  }

  /**
   * Update an existing game
   */
  async updateGame(
    gameId: number,
    userId: string,
    updates: {
      status?: string;
      completedAt?: Date | null;
      gameState?: BaseGameState;
    }
  ): Promise<GameWithState | null> {
    // Verify ownership
    const existingGame = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.userId, userId)),
    });

    if (!existingGame) {
      return null;
    }

    // Update game record
    const [updatedGame] = await db
      .update(games)
      .set({
        status: updates.status || existingGame.status,
        completedAt: updates.completedAt !== undefined ? updates.completedAt : existingGame.completedAt,
      })
      .where(eq(games.id, gameId))
      .returning();

    // Update game state if provided
    if (updates.gameState) {
      await this.saveGameState(gameId, updates.gameState);
    }

    // Reload to get reconstructed state
    return this.loadGame(gameId, userId);
  }

  /**
   * List games for a user, optionally filtered by type and status
   */
  async listGames(
    userId: string,
    options: {
      gameType?: string;
      status?: string;
      limit?: number;
    } = {}
  ): Promise<GameWithState[]> {
    const { gameType, status, limit = 50 } = options;

    const conditions = [eq(games.userId, userId)];
    if (gameType) {
      conditions.push(eq(games.gameType, gameType));
    }
    if (status) {
      conditions.push(eq(games.status, status));
    }

    const gameRecords = await db.query.games.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: [desc(games.createdAt)],
      limit,
      with: {
        frames: true,
      },
    });

    // Reconstruct game states
    const gamesWithState: GameWithState[] = [];
    for (const game of gameRecords) {
      try {
        const gameState = await this.reconstructGameState(game);
        gamesWithState.push({
          id: game.id,
          userId: game.userId,
          gameMode: game.gameMode,
          gameType: game.gameType,
          gameTypeSequence: game.gameTypeSequence,
          customGameId: game.customGameId,
          status: game.status,
          createdAt: game.createdAt,
          completedAt: game.completedAt,
          gameState,
        });
      } catch (error) {
        console.error(`Error reconstructing game ${game.id}:`, error);
        // Skip games that can't be reconstructed
      }
    }

    return gamesWithState;
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: number, userId: string): Promise<boolean> {
    // Verify ownership
    const game = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.userId, userId)),
    });

    if (!game) {
      return false;
    }

    // Delete frames first (foreign key constraint)
    await db.delete(frames).where(eq(frames.gameId, gameId));

    // Delete game
    await db.delete(games).where(eq(games.id, gameId));

    return true;
  }
}

// Export singleton instance
export const gamePersistenceService = new GamePersistenceService();

