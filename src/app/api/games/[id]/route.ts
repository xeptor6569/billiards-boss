import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gameParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { gamePersistenceService } from "@/lib/services/game-persistence-service";

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

    // Load game using persistence service
    const game = await gamePersistenceService.loadGame(gameId, session.user.id);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Load participants
    const participants = await db.query.gameParticipants.findMany({
      where: eq(gameParticipants.gameId, gameId),
    });

    // Return game with state
    return NextResponse.json({
      id: game.id,
      userId: game.userId,
      gameMode: game.gameMode,
      gameType: game.gameType,
      gameTypeSequence: game.gameTypeSequence,
      customGameId: game.customGameId,
      status: game.status,
      createdAt: game.createdAt,
      completedAt: game.completedAt,
      gameState: game.gameState,
      participants,
    });
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

    // Update game using persistence service
    const updatedGame = await gamePersistenceService.updateGame(gameId, session.user.id, {
      status: body.status,
      completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
      gameState: body.gameState,
    });

    if (!updatedGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Return simplified game record
    return NextResponse.json({
      id: updatedGame.id,
      userId: updatedGame.userId,
      gameMode: updatedGame.gameMode,
      gameType: updatedGame.gameType,
      gameTypeSequence: updatedGame.gameTypeSequence,
      customGameId: updatedGame.customGameId,
      status: updatedGame.status,
      createdAt: updatedGame.createdAt,
      completedAt: updatedGame.completedAt,
    });
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

    // Delete game using persistence service
    const deleted = await gamePersistenceService.deleteGame(gameId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Delete participants
    await db.delete(gameParticipants).where(eq(gameParticipants.gameId, gameId));

    return NextResponse.json({ message: "Game deleted" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

