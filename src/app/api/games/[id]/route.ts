import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { games, frames, gameParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
      with: {
        frames: true,
        participants: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check ownership
    if (game.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const gameId = parseInt(id);
    const body = await request.json();

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    // Verify ownership
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update game
    const [updatedGame] = await db
      .update(games)
      .set({
        status: body.status || game.status,
        completedAt: body.completedAt ? new Date(body.completedAt) : game.completedAt,
        ...(body.gameState?.frames && {
          // Update frames if provided
        }),
      })
      .where(eq(games.id, gameId))
      .returning();

    // Update frames if provided
    if (body.gameState?.frames) {
      // Delete existing frames
      await db.delete(frames).where(eq(frames.gameId, gameId));

      // Insert new frames
      const frameInserts = body.gameState.frames.map((frame: any) => ({
        gameId,
        frameNumber: frame.frameNumber,
        score: frame.score,
        isStrike: frame.isStrike,
        isSpare: frame.isSpare,
        ballsPocketed: frame.ballsPocketed.reduce(
          (sum: number, b: number) => sum + b,
          0
        ),
      }));

      if (frameInserts.length > 0) {
        await db.insert(frames).values(frameInserts);
      }
    }

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    // Verify ownership
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete frames first (foreign key constraint)
    await db.delete(frames).where(eq(frames.gameId, gameId));
    await db.delete(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    await db.delete(games).where(eq(games.id, gameId));

    return NextResponse.json({ message: "Game deleted" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

