--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_type" text DEFAULT 'bowlliards' NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "custom_game_id" integer;--> statement-breakpoint
CREATE TABLE "custom_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"yaml_config" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_custom_game_id_custom_games_id_fk" FOREIGN KEY ("custom_game_id") REFERENCES "public"."custom_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_games" ADD CONSTRAINT "custom_games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frames" ADD COLUMN "score_data" text;--> statement-breakpoint
ALTER TABLE "frames" ALTER COLUMN "balls_pocketed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "allows_custom_games" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "plans" SET "allows_custom_games" = true WHERE "tier" = 'premium';

