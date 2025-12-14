import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, games, frames, statistics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// API routes are inherently dynamic and don't need explicit dynamic export
export async function GET() {
  try {
    // During build/prerender, auth() may fail because headers() isn't available
    // This is expected and safe to ignore - API routes are never actually prerendered
    let session;
    try {
      session = await auth();
    } catch (authError: any) {
      // If this is a prerender/build-time error, return a safe response
      if (
        authError?.message?.includes("prerender") ||
        authError?.message?.includes("headers()")
      ) {
        // During build, return a placeholder response
        // This route will work correctly at runtime
        return NextResponse.json(
          { error: "This route requires authentication at runtime" },
          { status: 401 }
        );
      }
      throw authError;
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [user, userGames, userStats] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        with: {
          plan: true,
        },
      }),
      db.query.games.findMany({
        where: eq(games.userId, session.user.id),
        with: {
          frames: true,
          participants: true,
        },
        orderBy: (games, { desc }) => [desc(games.createdAt)],
      }),
      db.query.statistics.findFirst({
        where: eq(statistics.userId, session.user.id),
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare export data (exclude password)
    const { password, ...userWithoutPassword } = user;

    const exportData = {
      user: userWithoutPassword,
      statistics: userStats || null,
      games: userGames.map((game) => ({
        id: game.id,
        gameMode: game.gameMode,
        status: game.status,
        createdAt: game.createdAt,
        completedAt: game.completedAt,
        frames: game.frames,
        participants: game.participants,
      })),
      exportedAt: new Date().toISOString(),
    };

    // Return as JSON file download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="billiards-boss-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
