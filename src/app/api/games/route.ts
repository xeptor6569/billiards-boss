import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { games, frames, gameParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkGameLimit } from "@/lib/plan-checks";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let query = db.query.games.findMany({
      where: eq(games.userId, session.user.id),
      limit,
      orderBy: (games, { desc }) => [desc(games.createdAt)],
    });

    if (status) {
      // Filter by status if provided
      const allGames = await db.query.games.findMany({
        where: eq(games.userId, session.user.id),
      });
      const filtered = allGames.filter((g) => g.status === status);
      return NextResponse.json(filtered.slice(0, limit));
    }

    const userGames = await query;
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
    const { gameMode, gameState } = body;

    if (!gameMode || !["single", "multiplayer", "tournament"].includes(gameMode)) {
      return NextResponse.json(
        { error: "Invalid game mode" },
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
        status: gameState?.isComplete ? "completed" : "active",
        completedAt: gameState?.isComplete ? new Date() : null,
      })
      .returning();

    // Save frames if provided - store individual shots as JSON array
    if (gameState?.frames) {
      const frameInserts = gameState.frames
        .filter((frame: any) => frame.ballsPocketed.length > 0) // Only save frames with shots
        .map((frame: any) => ({
          gameId: newGame.id,
          frameNumber: frame.frameNumber,
          score: frame.score,
          isStrike: frame.isStrike,
          isSpare: frame.isSpare,
          // Store the full array of individual shots as JSON
          ballsPocketed: JSON.stringify(frame.ballsPocketed),
        }));

      if (frameInserts.length > 0) {
        await db.insert(frames).values(frameInserts);
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

