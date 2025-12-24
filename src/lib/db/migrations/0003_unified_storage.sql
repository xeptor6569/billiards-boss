--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "game_type_sequence" INTEGER;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_games_user_type_sequence" ON "games"("user_id", "game_type", "game_type_sequence");--> statement-breakpoint
ALTER TABLE "frames" ALTER COLUMN "balls_pocketed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "frames" ALTER COLUMN "is_strike" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "frames" ALTER COLUMN "is_spare" DROP NOT NULL;

