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

    if (!existsSync(migration1Path) || !existsSync(migration2Path)) {
      console.error("❌ Migration files not found!");
      console.error("Looking for:", migration1Path, migration2Path);
      process.exit(1);
    }

    const migration1 = readFileSync(migration1Path, "utf-8");
    const migration2 = readFileSync(migration2Path, "utf-8");

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
            // Ignore "already exists" errors
            if (
              error.message?.includes("already exists") ||
              error.message?.includes("duplicate") ||
              error.message?.includes("relation") && error.message?.includes("already exists")
            ) {
              console.log(`⚠ [${migrationName}] Skipped (already exists)`);
            } else {
              console.error(`❌ [${migrationName}] Error:`, error.message);
              throw error;
            }
          }
        }
      }
    };

    await executeSQL(migration1, "0000_thankful_metal_master");
    await executeSQL(migration2, "0001_stiff_korvac");

    console.log("✅ Migrations completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
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

