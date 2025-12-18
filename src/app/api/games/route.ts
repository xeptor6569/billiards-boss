import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { games, frames, gameParticipants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkGameLimit } from "@/lib/plan-checks";
import { serializeGameState, reconstructGameState } from "@/lib/game-types/factory";
import { getGameType } from "@/lib/game-types";

// With cacheComponents enabled, routes are dynamic by default
// This route uses request.url which requires runtime evaluation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const gameType = url.searchParams.get("gameType");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let whereConditions: any[] = [eq(games.userId, session.user.id)];
    
    if (status) {
      whereConditions.push(eq(games.status, status));
    }
    
    if (gameType) {
      whereConditions.push(eq(games.gameType, gameType));
    }

    const userGames = await db.query.games.findMany({
      where: whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0],
      limit,
      orderBy: (games, { desc }) => [desc(games.createdAt)],
    });

    return NextResponse.json(userGames);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gameMode, gameState, gameType, customGameId } = body;

    if (!gameMode || !["single", "multiplayer", "tournament"].includes(gameMode)) {
      return NextResponse.json(
        { error: "Invalid game mode" },
        { status: 400 }
      );
    }

    // Validate game type
    const validGameTypes = ['bowlliards', 'apa8ball', 'apa9ball', 'straight-pool', 'custom'];
    const gameTypeValue = gameType || 'bowlliards'; // Default to bowlliards for backward compatibility
    
    if (!validGameTypes.includes(gameTypeValue)) {
      return NextResponse.json(
        { error: "Invalid game type" },
        { status: 400 }
      );
    }

    // For custom games, validate customGameId
    if (gameTypeValue === 'custom' && !customGameId) {
      return NextResponse.json(
        { error: "customGameId is required for custom games" },
        { status: 400 }
      );
    }

    // Check game limit for authenticated users
    const limitCheck = await checkGameLimit(session.user.id);
    if (!limitCheck.allowed && gameState?.isComplete) {
      return NextResponse.json(
        {
          error: limitCheck.reason || "Game limit reached",
          gamesCount: limitCheck.gamesCount,
          maxGames: limitCheck.maxGames,
        },
        { status: 403 }
      );
    }

    // Create game
    const [newGame] = await db
      .insert(games)
      .values({
        userId: session.user.id,
        gameMode,
        gameType: gameTypeValue,
        customGameId: gameTypeValue === 'custom' ? customGameId : null,
        status: gameState?.isComplete ? "completed" : "active",
        completedAt: gameState?.isComplete ? new Date() : null,
      })
      .returning();

    // Save game state - handle different game types
    if (gameState) {
      const gameTypeHandler = getGameType(gameTypeValue);
      if (gameTypeHandler) {
        // Serialize game state using game type handler
        const serialized = gameTypeHandler.serialize(gameState);
        
        // For Bowlliards (backward compatibility), save as frames
        if (gameTypeValue === 'bowlliards' && serialized.frames) {
          const frameInserts = serialized.frames
            .filter((frame: any) => frame.ballsPocketed && frame.ballsPocketed.length > 0)
            .map((frame: any) => ({
              gameId: newGame.id,
              frameNumber: frame.frameNumber,
              score: frame.score,
              isStrike: frame.isStrike || false,
              isSpare: frame.isSpare || false,
              scoreData: JSON.stringify(frame.ballsPocketed),
              ballsPocketed: JSON.stringify(frame.ballsPocketed), // Backward compatibility
            }));

          if (frameInserts.length > 0) {
            await db.insert(frames).values(frameInserts);
          }
        } else {
          // For other game types, save as a single frame/entry with scoreData
          // Store the entire serialized state
          await db.insert(frames).values({
            gameId: newGame.id,
            frameNumber: 1, // Use frameNumber 1 for non-frame-based games
            score: serialized.totalScore || 0,
            isStrike: false,
            isSpare: false,
            scoreData: JSON.stringify(serialized),
            ballsPocketed: null, // Not applicable for non-Bowlliards games
          });
        }
      }
    }

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

