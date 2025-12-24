/**
 * Migration script to copy games from old database volume to new database
 * 
 * Usage:
 * 1. Set OLD_DATABASE_URL environment variable to point to the old database
 * 2. Ensure NEW_DATABASE_URL (or DATABASE_URL) points to the current database
 * 3. Run: tsx scripts/migrate-games-from-old-db.ts
 * 
 * This script will:
 * - Copy all games from old DB to new DB
 * - Remap game IDs to avoid conflicts
 * - Copy associated frames
 * - Preserve timestamps and relationships
 * - Handle the new game_type field (defaults to 'bowlliards' for old games)
 */

import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { games, frames, gameParticipants } from "../src/lib/db/schema";
import * as schema from "../src/lib/db/schema";

// Get database URLs
const OLD_DB_URL = process.env.OLD_DATABASE_URL;
const NEW_DB_URL = process.env.DATABASE_URL || process.env.NEW_DATABASE_URL;

if (!OLD_DB_URL) {
  console.error("❌ OLD_DATABASE_URL environment variable is required");
  console.error("   Set it to the connection string for the old database volume");
  console.error("   Example: export OLD_DATABASE_URL='postgresql://user:pass@host:5432/db'");
  process.exit(1);
}

if (!NEW_DB_URL) {
  console.error("❌ DATABASE_URL or NEW_DATABASE_URL environment variable is required");
  console.error("   Set it to the connection string for the current database");
  process.exit(1);
}

// Connect to both databases
console.log("🔌 Connecting to databases...");
const oldPool = new Pool({ connectionString: OLD_DB_URL });
const newPool = new Pool({ connectionString: NEW_DB_URL });

const oldDb = drizzle(oldPool);
const newDb = drizzle(newPool, { schema });

interface OldGame {
  id: number;
  user_id: string;
  game_mode: string;
  status: string;
  created_at: Date;
  completed_at: Date | null;
  game_type?: string | null;
  custom_game_id?: number | null;
}

interface OldFrame {
  id: number;
  game_id: number;
  frame_number: number;
  score: number;
  is_strike: boolean;
  is_spare: boolean;
  balls_pocketed: string | null;
  score_data: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OldGameParticipant {
  id: number;
  game_id: number;
  user_id: string;
  player_order: number;
  total_score: number;
  created_at: Date;
}

async function migrateGames() {
  try {
    console.log("\n📊 Starting game migration...\n");

    // Step 1: Get all games from old database
    console.log("1️⃣  Fetching games from old database...");
    
    // Check if game_type column exists in old database
    let hasGameTypeColumn = false;
    try {
      const columnCheck = await oldPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'game_type'
      `);
      hasGameTypeColumn = columnCheck.rows.length > 0;
    } catch {
      // If query fails, assume column doesn't exist
      hasGameTypeColumn = false;
    }
    
    const gameTypeSelect = hasGameTypeColumn 
      ? "COALESCE(game_type, 'bowlliards') as game_type"
      : "'bowlliards' as game_type";
    const customGameIdSelect = hasGameTypeColumn
      ? "custom_game_id"
      : "NULL as custom_game_id";
    
    const oldGamesResult = await oldPool.query<OldGame>(`
      SELECT id, user_id, game_mode, status, created_at, completed_at, 
             ${gameTypeSelect}, ${customGameIdSelect}
      FROM games
      ORDER BY id
    `);
    const oldGames = oldGamesResult.rows;
    
    console.log(`   Found ${oldGames.length} games in old database`);

    if (oldGames.length === 0) {
      console.log("✅ No games to migrate");
      return;
    }

    // Step 2: Get current max game ID in new database to avoid conflicts
    console.log("\n2️⃣  Checking current database state...");
    const maxIdResult = await newPool.query<{ max_id: number | null }>(`
      SELECT MAX(id) as max_id FROM games
    `);
    const maxId = maxIdResult.rows[0]?.max_id || 0;
    const idOffset = maxId + 1000; // Add offset to ensure no conflicts
    console.log(`   Current max game ID: ${maxId}`);
    console.log(`   Will start new game IDs from: ${idOffset}`);

    // Step 3: Create ID mapping (old ID -> new ID)
    const gameIdMap = new Map<number, number>();
    oldGames.forEach((game, index) => {
      gameIdMap.set(game.id, idOffset + index);
    });

    // Step 4: Verify users exist in new database
    console.log("\n3️⃣  Verifying users exist in new database...");
    const uniqueUserIds = [...new Set(oldGames.map(g => g.user_id))];
    
    // Check each user individually (safer for SQL injection)
    const existingUserIds = new Set<string>();
    for (const userId of uniqueUserIds) {
      const result = await newPool.query<{ id: string }>(
        `SELECT id FROM users WHERE id = $1`,
        [userId]
      );
      if (result.rows.length > 0) {
        existingUserIds.add(userId);
      }
    }
    const missingUsers = uniqueUserIds.filter(id => !existingUserIds.has(id));
    
    if (missingUsers.length > 0) {
      console.warn(`   ⚠️  Warning: ${missingUsers.length} users don't exist in new database:`);
      missingUsers.forEach(id => console.warn(`      - ${id}`));
      console.warn("   Games for these users will be skipped");
    }

    // Step 5: Migrate games
    console.log("\n4️⃣  Migrating games...");
    let migratedCount = 0;
    let skippedCount = 0;

    for (const oldGame of oldGames) {
      // Skip if user doesn't exist
      if (!existingUserIds.has(oldGame.user_id)) {
        console.log(`   ⏭️  Skipping game ${oldGame.id} (user ${oldGame.user_id} not found)`);
        skippedCount++;
        continue;
      }

      // Check if game already exists (by checking if new ID range is used)
      const newGameId = gameIdMap.get(oldGame.id)!;
      const existingGame = await newPool.query<{ id: number }>(
        `SELECT id FROM games WHERE id = $1`,
        [newGameId]
      );

      if (existingGame.rows.length > 0) {
        console.log(`   ⏭️  Skipping game ${oldGame.id} (already exists as ${newGameId})`);
        skippedCount++;
        continue;
      }

      // Insert game into new database
      try {
        await newDb.insert(games).values({
          id: newGameId,
          userId: oldGame.user_id,
          gameMode: oldGame.game_mode,
          gameType: oldGame.game_type || 'bowlliards', // Default to bowlliards for old games
          customGameId: oldGame.custom_game_id || null,
          status: oldGame.status,
          createdAt: oldGame.created_at,
          completedAt: oldGame.completed_at,
        });

        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`   ✅ Migrated ${migratedCount} games...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating game ${oldGame.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n   ✅ Migrated ${migratedCount} games`);
    if (skippedCount > 0) {
      console.log(`   ⏭️  Skipped ${skippedCount} games`);
    }

    // Step 6: Migrate frames
    console.log("\n5️⃣  Migrating frames...");
    
    // Check if score_data and updated_at columns exist in old database
    let hasScoreDataColumn = false;
    let hasUpdatedAtColumn = false;
    try {
      const columnCheck = await oldPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'frames' AND column_name IN ('score_data', 'updated_at')
      `);
      const columns = columnCheck.rows.map(r => r.column_name);
      hasScoreDataColumn = columns.includes('score_data');
      hasUpdatedAtColumn = columns.includes('updated_at');
    } catch {
      hasScoreDataColumn = false;
      hasUpdatedAtColumn = false;
    }
    
    const scoreDataSelect = hasScoreDataColumn
      ? "score_data"
      : "NULL as score_data";
    const updatedAtSelect = hasUpdatedAtColumn
      ? "updated_at"
      : "created_at as updated_at";
    
    const oldFramesResult = await oldPool.query<OldFrame>(`
      SELECT id, game_id, frame_number, score, is_strike, is_spare, 
             balls_pocketed, ${scoreDataSelect}, created_at, ${updatedAtSelect}
      FROM frames
      ORDER BY game_id, frame_number
    `);
    const oldFrames = oldFramesResult.rows;

    console.log(`   Found ${oldFrames.length} frames in old database`);

    let frameMigratedCount = 0;
    let frameSkippedCount = 0;

    for (const oldFrame of oldFrames) {
      const newGameId = gameIdMap.get(oldFrame.game_id);
      
      // Skip if game wasn't migrated
      if (!newGameId) {
        frameSkippedCount++;
        continue;
      }

      try {
        const frameValues: {
          gameId: number;
          frameNumber: number;
          score: number;
          isStrike: boolean;
          isSpare: boolean;
          scoreData: string;
          ballsPocketed?: string;
          createdAt: Date;
          updatedAt: Date;
        } = {
          gameId: newGameId,
          frameNumber: oldFrame.frame_number,
          score: oldFrame.score,
          isStrike: oldFrame.is_strike || false,
          isSpare: oldFrame.is_spare || false,
          scoreData: oldFrame.score_data || oldFrame.balls_pocketed || JSON.stringify({ gameType: "bowlliards", totalScore: oldFrame.score, isComplete: false, gameData: {} }),
          createdAt: oldFrame.created_at,
          updatedAt: oldFrame.updated_at,
        };
        
        // Only include ballsPocketed if it has a value
        if (oldFrame.balls_pocketed) {
          frameValues.ballsPocketed = oldFrame.balls_pocketed;
        }
        
        await newDb.insert(frames).values(frameValues);

        frameMigratedCount++;
        if (frameMigratedCount % 50 === 0) {
          console.log(`   ✅ Migrated ${frameMigratedCount} frames...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating frame ${oldFrame.id} for game ${oldFrame.game_id}:`, error.message);
        frameSkippedCount++;
      }
    }

    console.log(`\n   ✅ Migrated ${frameMigratedCount} frames`);
    if (frameSkippedCount > 0) {
      console.log(`   ⏭️  Skipped ${frameSkippedCount} frames`);
    }

    // Step 7: Migrate game participants (if any)
    console.log("\n6️⃣  Migrating game participants...");
    const oldParticipantsResult = await oldPool.query<OldGameParticipant>(`
      SELECT id, game_id, user_id, player_order, total_score, created_at
      FROM game_participants
      ORDER BY game_id, player_order
    `);
    const oldParticipants = oldParticipantsResult.rows;

    console.log(`   Found ${oldParticipants.length} participants in old database`);

    let participantMigratedCount = 0;
    let participantSkippedCount = 0;

    for (const oldParticipant of oldParticipants) {
      const newGameId = gameIdMap.get(oldParticipant.game_id);
      
      // Skip if game wasn't migrated
      if (!newGameId) {
        participantSkippedCount++;
        continue;
      }

      // Skip if user doesn't exist
      if (!existingUserIds.has(oldParticipant.user_id)) {
        participantSkippedCount++;
        continue;
      }

      try {
        await newDb.insert(gameParticipants).values({
          gameId: newGameId,
          userId: oldParticipant.user_id,
          playerOrder: oldParticipant.player_order,
          totalScore: oldParticipant.total_score,
          createdAt: oldParticipant.created_at,
        });

        participantMigratedCount++;
      } catch (error: any) {
        console.error(`   ❌ Error migrating participant ${oldParticipant.id}:`, error.message);
        participantSkippedCount++;
      }
    }

    console.log(`\n   ✅ Migrated ${participantMigratedCount} participants`);
    if (participantSkippedCount > 0) {
      console.log(`   ⏭️  Skipped ${participantSkippedCount} participants`);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`Games:     ${migratedCount} migrated, ${skippedCount} skipped`);
    console.log(`Frames:    ${frameMigratedCount} migrated, ${frameSkippedCount} skipped`);
    console.log(`Participants: ${participantMigratedCount} migrated, ${participantSkippedCount} skipped`);
    console.log("=".repeat(60));
    console.log("\n✅ Migration completed!");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    // Close database connections
    await oldPool.end();
    await newPool.end();
  }
}

// Run migration
migrateGames()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

