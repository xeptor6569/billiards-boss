import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkGameLimit } from "@/lib/plan-checks";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";

// With cacheComponents enabled, routes are dynamic by default
// This route uses request.url which requires runtime evaluation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate that user exists in database (handles case where DB was reset but session is still valid)
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!userExists) {
      // User doesn't exist - session is invalid, return 401 to force re-authentication
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const gameType = url.searchParams.get("gameType") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const games = await gamePersistenceService.listGames(session.user.id, {
      gameType,
      status,
      limit,
    });

    // Return simplified game records (without full gameState for list view)
    const gameList = games.map((game) => ({
      id: game.id,
      userId: game.userId,
      gameMode: game.gameMode,
      gameType: game.gameType,
      gameTypeSequence: game.gameTypeSequence,
      customGameId: game.customGameId,
      status: game.status,
      createdAt: game.createdAt,
      completedAt: game.completedAt,
    }));

    return NextResponse.json(gameList);
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

    // Validate that user exists in database (handles case where DB was reset but session is still valid)
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!userExists) {
      // User doesn't exist - session is invalid, return 401 to force re-authentication
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 401 }
      );
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
    const gameTypeValue = gameType || 'bowlliards';
    
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
    // Note: userExists check above ensures user is in database
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

    // Create game using persistence service
    const newGame = await gamePersistenceService.createGame({
      userId: session.user.id,
      gameMode,
      gameType: gameTypeValue,
      customGameId: customGameId || null,
      gameState: gameState || { gameType: gameTypeValue, totalScore: 0, isComplete: false, gameData: {} },
    });

    // Return simplified game record
    return NextResponse.json({
      id: newGame.id,
      userId: newGame.userId,
      gameMode: newGame.gameMode,
      gameType: newGame.gameType,
      gameTypeSequence: newGame.gameTypeSequence,
      customGameId: newGame.customGameId,
      status: newGame.status,
      createdAt: newGame.createdAt,
      completedAt: newGame.completedAt,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating game:", error);
    
    // Check for foreign key violation (user doesn't exist)
    if (error?.code === '23503' || error?.cause?.code === '23503' || 
        (error?.message && error.message.includes('violates foreign key constraint'))) {
      return NextResponse.json(
        { error: "User not found in database. Please sign out and sign in again." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

