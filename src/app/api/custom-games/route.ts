import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/db";
import { customGames } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseCustomGameYAML } from "@/lib/game-types/custom/yaml-parser";
import { checkCustomGamesAccess } from "@/lib/plan-checks";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCustomGames = await db.query.customGames.findMany({
      where: eq(customGames.userId, session.user.id),
      orderBy: (customGames, { desc }) => [desc(customGames.createdAt)],
    });

    return NextResponse.json(userCustomGames);
  } catch (error) {
    console.error("Error fetching custom games:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom games" },
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

    // Check if user has access to custom games
    const hasAccess = await checkCustomGamesAccess(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Custom games require a premium subscription" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, yamlConfig } = body;

    if (!name || !yamlConfig) {
      return NextResponse.json(
        { error: "Name and yamlConfig are required" },
        { status: 400 }
      );
    }

    // Parse and validate YAML
    const parsed = parseCustomGameYAML(yamlConfig);
    if (parsed.error || !parsed.config) {
      return NextResponse.json(
        { error: `Invalid YAML configuration: ${parsed.error}` },
        { status: 400 }
      );
    }

    // Create custom game
    const [newCustomGame] = await db
      .insert(customGames)
      .values({
        userId: session.user.id,
        name,
        description: description || null,
        yamlConfig,
      })
      .returning();

    return NextResponse.json(newCustomGame, { status: 201 });
  } catch (error) {
    console.error("Error creating custom game:", error);
    return NextResponse.json(
      { error: "Failed to create custom game" },
      { status: 500 }
    );
  }
}

