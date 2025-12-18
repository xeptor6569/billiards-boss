import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { games, frames, gameParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { reconstructGameState, serializeGameState } from "@/lib/game-types/factory";
import { getGameType } from "@/lib/game-types";

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

    // Reconstruct game state based on game type
    const gameType = game.gameType || 'bowlliards'; // Default for backward compatibility
    const gameTypeHandler = getGameType(gameType);
    
    let reconstructedState = null;
    if (gameTypeHandler && game.frames.length > 0) {
      // For Bowlliards, reconstruct from frames
      if (gameType === 'bowlliards') {
        const parsedFrames = game.frames.map((frame) => ({
          frameNumber: frame.frameNumber,
          ballsPocketed: frame.ballsPocketed ? JSON.parse(frame.ballsPocketed as string) : 
                        (frame.scoreData ? JSON.parse(frame.scoreData as string) : []),
          score: frame.score,
          isStrike: frame.isStrike,
          isSpare: frame.isSpare,
        }));
        reconstructedState = gameTypeHandler.reconstructFromData({ frames: parsedFrames });
      } else {
        // For other game types, reconstruct from scoreData
        const firstFrame = game.frames[0];
        if (firstFrame?.scoreData) {
          const scoreData = JSON.parse(firstFrame.scoreData as string);
          reconstructedState = gameTypeHandler.reconstructFromData(scoreData);
        }
      }
    }

    const gameWithParsedFrames = {
      ...game,
      frames: game.frames.map((frame) => ({
        ...frame,
        ballsPocketed: frame.ballsPocketed ? JSON.parse(frame.ballsPocketed as string) : null,
        scoreData: frame.scoreData ? JSON.parse(frame.scoreData as string) : null,
      })),
      gameState: reconstructedState,
    };

    return NextResponse.json(gameWithParsedFrames);
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
    const gameType = game.gameType || 'bowlliards';
    const gameTypeHandler = getGameType(gameType);
    
    const [updatedGame] = await db
      .update(games)
      .set({
        status: body.status || game.status,
        completedAt: body.completedAt ? new Date(body.completedAt) : game.completedAt,
      })
      .where(eq(games.id, gameId))
      .returning();

    // Update frames/game state if provided
    if (body.gameState && gameTypeHandler) {
      // Delete existing frames
      await db.delete(frames).where(eq(frames.gameId, gameId));

      // Serialize game state using game type handler
      const serialized = gameTypeHandler.serialize(body.gameState);
      
      // For Bowlliards (backward compatibility), save as frames
      if (gameType === 'bowlliards' && serialized.frames) {
        const frameInserts = serialized.frames
          .filter((frame: any) => frame.ballsPocketed && frame.ballsPocketed.length > 0)
          .map((frame: any) => ({
            gameId,
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
        await db.insert(frames).values({
          gameId,
          frameNumber: 1,
          score: serialized.totalScore || 0,
          isStrike: false,
          isSpare: false,
          scoreData: JSON.stringify(serialized),
          ballsPocketed: null,
        });
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

