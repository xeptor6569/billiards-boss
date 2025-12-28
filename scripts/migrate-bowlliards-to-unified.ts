/**
 * Migration script to convert existing Bowlliards games from frame-based storage
 * to unified scoreData JSON format.
 * 
 * Since we only have 3 test users, this can be run to migrate existing data,
 * or test data can be reset if migration is complex.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { games, frames } from "../src/lib/db/schema";
import * as schema from "../src/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

interface FrameData {
  frameNumber: number;
  ballsPocketed: number[];
  score: number;
  isStrike: boolean;
  isSpare: boolean;
}

async function migrateBowlliardsGames() {
  console.log("Starting Bowlliards to unified storage migration...");

  // Find all Bowlliards games
  const bowlliardsGames = await db.query.games.findMany({
    where: eq(games.gameType, "bowlliards"),
    with: {
      frames: {
        orderBy: (frames, { asc }) => [asc(frames.frameNumber)],
      },
    },
  });

  console.log(`Found ${bowlliardsGames.length} Bowlliards games to migrate`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const game of bowlliardsGames) {
    try {
      // Check if already migrated (has scoreData in first frame)
      const firstFrame = game.frames[0];
      if (firstFrame?.scoreData) {
        try {
          const parsed = JSON.parse(firstFrame.scoreData);
          // If it already has a proper structure, skip
          if (parsed.gameType === "bowlliards" && parsed.gameData?.frames) {
            console.log(`Game ${game.id} already migrated, skipping`);
            skipped++;
            continue;
          }
        } catch {
          // Not valid JSON or wrong format, proceed with migration
        }
      }

      // Convert frames to unified format
      const framesData: FrameData[] = game.frames
        .filter((f) => f.ballsPocketed) // Only frames with data
        .map((frame) => {
          let ballsPocketed: number[] = [];
          if (typeof frame.ballsPocketed === "string") {
            try {
              ballsPocketed = JSON.parse(frame.ballsPocketed);
            } catch {
              ballsPocketed = [];
            }
          } else if (Array.isArray(frame.ballsPocketed)) {
            ballsPocketed = frame.ballsPocketed;
          }

          return {
            frameNumber: frame.frameNumber,
            ballsPocketed,
            score: frame.score,
            isStrike: frame.isStrike || false,
            isSpare: frame.isSpare || false,
          };
        });

      // Calculate total score
      const totalScore = framesData.reduce((sum, frame) => sum + frame.score, 0);

      // Determine current frame and completion status
      const incompleteFrames = framesData.filter(
        (f) => f.ballsPocketed.length === 0 || (f.frameNumber === 10 && f.ballsPocketed.length < 2)
      );
      const currentFrame = incompleteFrames.length > 0 
        ? incompleteFrames[0].frameNumber 
        : 11; // All complete
      const isComplete = framesData.length === 10 && framesData.every(
        (f) => f.ballsPocketed.length >= 2 || f.isStrike || f.isSpare
      );

      // Create unified game state structure
      const unifiedState = {
        gameType: "bowlliards",
        totalScore,
        isComplete,
        gameData: {
          frames: framesData,
          currentFrame,
        },
      };

      // Update or create frame with scoreData
      if (game.frames.length > 0) {
        // Update first frame with unified data
        await db
          .update(frames)
          .set({
            scoreData: JSON.stringify(unifiedState),
            score: totalScore,
          })
          .where(eq(frames.id, game.frames[0].id));

        // Delete other frames (data is now in scoreData)
        if (game.frames.length > 1) {
          const otherFrameIds = game.frames.slice(1).map((f) => f.id);
          await db.delete(frames).where(
            sql`${frames.id} IN (${sql.join(otherFrameIds.map(id => sql`${id}`), sql`, `)})`
          );
        }
      } else {
        // Create new frame with unified data
        await db.insert(frames).values({
          gameId: game.id,
          frameNumber: 1,
          score: totalScore,
          isStrike: false,
          isSpare: false,
          scoreData: JSON.stringify(unifiedState),
          ballsPocketed: null,
        });
      }

      // Calculate and set gameTypeSequence if not set
      if (!game.gameTypeSequence) {
        // Get max sequence for this user and game type
        const maxSeqResult = await db
          .select({ maxSeq: sql<number>`MAX(${games.gameTypeSequence})` })
          .from(games)
          .where(
            and(
              eq(games.userId, game.userId),
              eq(games.gameType, "bowlliards")
            )
          );

        const nextSequence = (maxSeqResult[0]?.maxSeq || 0) + 1;

        await db
          .update(games)
          .set({ gameTypeSequence: nextSequence })
          .where(eq(games.id, game.id));
      }

      migrated++;
      console.log(`Migrated game ${game.id} (sequence: ${game.gameTypeSequence || "pending"})`);
    } catch (error) {
      errors++;
      console.error(`Error migrating game ${game.id}:`, error);
    }
  }

  console.log("\nMigration complete:");
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);

  await pool.end();
}

// Run migration
migrateBowlliardsGames().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

