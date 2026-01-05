import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { games, frames, gameParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const userId = session.user.id;

    // Get all games for this user
    const userGames = await db.query.games.findMany({
      where: eq(games.userId, userId),
    });

    if (userGames.length === 0) {
      return NextResponse.json({
        message: "No games found to delete",
      });
    }

    // Delete all frames for user's games
    const gameIds = userGames.map(g => g.id);
    for (const gameId of gameIds) {
      await db.delete(frames).where(eq(frames.gameId, gameId));
      await db.delete(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    }

    // Delete all games for this user
    await db.delete(games).where(eq(games.userId, userId));

    return NextResponse.json({
      message: `Successfully deleted ${userGames.length} game(s) and associated data`,
      deletedCount: userGames.length,
    });
  } catch (error) {
    console.error("Error resetting game history:", error);
    return NextResponse.json(
      { 
        error: "Failed to reset game history",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

