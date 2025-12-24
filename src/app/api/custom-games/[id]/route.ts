import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customGames } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseCustomGameYAML } from "@/lib/game-types/custom/yaml-parser";
import { checkCustomGamesAccess } from "@/lib/plan-checks";

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
    const customGameId = parseInt(id);

    if (isNaN(customGameId)) {
      return NextResponse.json(
        { error: "Invalid custom game ID" },
        { status: 400 }
      );
    }

    const customGame = await db.query.customGames.findFirst({
      where: and(
        eq(customGames.id, customGameId),
        eq(customGames.userId, session.user.id)
      ),
    });

    if (!customGame) {
      return NextResponse.json(
        { error: "Custom game not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customGame);
  } catch (error) {
    console.error("Error fetching custom game:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom game" },
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
    const customGameId = parseInt(id);

    if (isNaN(customGameId)) {
      return NextResponse.json(
        { error: "Invalid custom game ID" },
        { status: 400 }
      );
    }

    // Check if user has access to custom games
    const hasAccess = await checkCustomGamesAccess(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Custom games require a premium subscription" },
        { status: 403 }
      );
    }

    // Verify ownership
    const existingGame = await db.query.customGames.findFirst({
      where: and(
        eq(customGames.id, customGameId),
        eq(customGames.userId, session.user.id)
      ),
    });

    if (!existingGame) {
      return NextResponse.json(
        { error: "Custom game not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, yamlConfig } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (yamlConfig !== undefined) {
      // Parse and validate YAML
      const parsed = parseCustomGameYAML(yamlConfig);
      if (parsed.error || !parsed.config) {
        return NextResponse.json(
          { error: `Invalid YAML configuration: ${parsed.error}` },
          { status: 400 }
        );
      }
      updateData.yamlConfig = yamlConfig;
    }

    const [updatedGame] = await db
      .update(customGames)
      .set(updateData)
      .where(eq(customGames.id, customGameId))
      .returning();

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating custom game:", error);
    return NextResponse.json(
      { error: "Failed to update custom game" },
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
    const customGameId = parseInt(id);

    if (isNaN(customGameId)) {
      return NextResponse.json(
        { error: "Invalid custom game ID" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingGame = await db.query.customGames.findFirst({
      where: and(
        eq(customGames.id, customGameId),
        eq(customGames.userId, session.user.id)
      ),
    });

    if (!existingGame) {
      return NextResponse.json(
        { error: "Custom game not found" },
        { status: 404 }
      );
    }

    await db.delete(customGames).where(eq(customGames.id, customGameId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom game:", error);
    return NextResponse.json(
      { error: "Failed to delete custom game" },
      { status: 500 }
    );
  }
}

