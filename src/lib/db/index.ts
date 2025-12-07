import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// During build time, Next.js may try to import this module without DATABASE_URL
// We use a placeholder connection string during build to allow the module to be imported
// The actual connection will be validated and established at runtime
const connectionString = process.env.DATABASE_URL || "postgresql://build-time-placeholder";

// Validate DATABASE_URL at runtime (not during build)
// This allows the module to be imported during Next.js build phase
if (!process.env.DATABASE_URL) {
  // Only warn during build - actual error will occur when DB is used at runtime
  if (process.env.NEXT_PHASE === "phase-production-build") {
    // Silently allow during build
  } else if (typeof window === "undefined") {
    // Warn in server context (but don't throw to allow build to continue)
    console.warn("⚠️  DATABASE_URL is not set. Database operations will fail at runtime.");
  }
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

