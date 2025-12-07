ALTER TABLE "frames" ALTER COLUMN "balls_pocketed" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "frames" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;