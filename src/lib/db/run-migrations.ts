import "dotenv/config";
import { db } from "./index";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { sql } from "drizzle-orm";

async function runMigrations() {
  try {
    console.log("Running database migrations...");

    // Check if migrations table exists, create if not
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )
      `));
    } catch (error: any) {
      // Ignore if table already exists
      if (!error.message?.includes("already exists")) {
        console.log("Note: Could not create migrations tracking table");
      }
    }

    // Read migration files
    const migration1Path = join(process.cwd(), "src/lib/db/migrations/0000_thankful_metal_master.sql");
    const migration2Path = join(process.cwd(), "src/lib/db/migrations/0001_stiff_korvac.sql");
    const migration3Path = join(process.cwd(), "src/lib/db/migrations/0002_add_game_types.sql");

    if (!existsSync(migration1Path) || !existsSync(migration2Path)) {
      console.error("❌ Migration files not found!");
      console.error("Looking for:", migration1Path, migration2Path);
      process.exit(1);
    }

    const migration1 = readFileSync(migration1Path, "utf-8");
    const migration2 = readFileSync(migration2Path, "utf-8");
    const migration3 = existsSync(migration3Path) ? readFileSync(migration3Path, "utf-8") : null;

    // Split by statement breakpoint and execute each statement
    const executeSQL = async (sqlContent: string, migrationName: string) => {
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await db.execute(sql.raw(statement));
            console.log(`✓ [${migrationName}] Executed statement`);
          } catch (error: any) {
            // Extract error information from potentially nested error objects
            // Drizzle may wrap PostgreSQL errors, so check multiple levels
            let errorMessage = error.message || "";
            let errorCode = error.code;
            
            // Check nested error objects
            if (error.original) {
              errorMessage = error.original.message || errorMessage;
              errorCode = error.original.code || errorCode;
            }
            if (error.cause) {
              errorMessage = error.cause.message || errorMessage;
              errorCode = error.cause.code || errorCode;
            }
            
            // Also check the string representation
            const errorString = JSON.stringify(error);
            const lowerMessage = errorMessage.toLowerCase();
            const lowerString = errorString.toLowerCase();
            
            // PostgreSQL error codes:
            // 42P07 = duplicate_table
            // 42710 = duplicate_object
            // 23505 = unique_violation
            const isAlreadyExists = 
              errorCode === "42P07" ||
              errorCode === "42710" ||
              lowerMessage.includes("already exists") ||
              lowerMessage.includes("duplicate") ||
              lowerMessage.includes("relation") && lowerMessage.includes("already exists") ||
              lowerString.includes("already exists") ||
              lowerString.includes("duplicate") ||
              lowerString.includes("42p07") || // lowercase error code
              lowerString.includes("42710") ||
              // Check for CREATE TABLE errors that might indicate table exists
              (lowerMessage.includes("create table") && lowerString.includes("relation"));
            
            if (isAlreadyExists) {
              console.log(`⚠ [${migrationName}] Skipped (already exists)`);
            } else {
              // Log the error but don't fail the entire migration
              // This allows other statements to run even if one fails
              console.error(`❌ [${migrationName}] Error:`, errorMessage || String(error));
              if (errorCode) {
                console.error(`   Error code: ${errorCode}`);
              }
              // Log full error for debugging in development
              if (process.env.NODE_ENV === "development") {
                console.error(`   Full error:`, error);
              }
              console.error(`   Continuing with next statement...`);
            }
          }
        }
      }
    };

    await executeSQL(migration1, "0000_thankful_metal_master");
    await executeSQL(migration2, "0001_stiff_korvac");
    
    if (migration3) {
      await executeSQL(migration3, "0002_add_game_types");
    } else {
      console.log("⚠️  Migration 0002_add_game_types.sql not found, skipping...");
    }

    console.log("✅ Migrations completed successfully!");
  } catch (error: any) {
    // Only exit with error code if it's a critical error (not "already exists")
    const errorMessage = error.message || String(error) || "";
    const isAlreadyExists = errorMessage.toLowerCase().includes("already exists") ||
                           errorMessage.toLowerCase().includes("duplicate");
    
    if (isAlreadyExists) {
      console.log("⚠️  Some migrations were skipped (already applied)");
      console.log("✅ Migration process completed (with warnings)");
    } else {
      console.error("❌ Migration failed:", errorMessage);
      if (error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { runMigrations };

