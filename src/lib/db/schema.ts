import { pgTable, text, integer, timestamp, boolean, decimal, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password"), // Hashed password for credentials auth
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  planId: integer("plan_id").references(() => plans.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans table (for future monetization)
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull(), // 'free', 'premium', etc.
  maxGames: integer("max_games"), // null = unlimited
  allowsMultiplayer: boolean("allows_multiplayer").default(false).notNull(),
  allowsTournaments: boolean("allows_tournaments").default(false).notNull(),
  allowsCustomGames: boolean("allows_custom_games").default(false).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }), // null = free
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions table (for future monetization)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  stripeSubscriptionId: text("stripe_subscription_id"), // for Stripe integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Custom games table (for user-defined games)
export const customGames = pgTable("custom_games", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  yamlConfig: text("yaml_config").notNull(), // YAML game definition
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  gameMode: text("game_mode").notNull(), // 'single', 'multiplayer', 'tournament'
  gameType: text("game_type").notNull().default("bowlliards"), // 'bowlliards', 'apa8ball', 'apa9ball', 'straight-pool', 'custom'
  gameTypeSequence: integer("game_type_sequence"), // Sequence number per game type per user (e.g., Bowlliards #1, #2, #3...)
  customGameId: integer("custom_game_id").references(() => customGames.id), // null unless gameType is 'custom'
  status: text("status").notNull().default("active"), // 'active', 'completed', 'abandoned'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Frames table (flexible for different game types)
export const frames = pgTable("frames", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  frameNumber: integer("frame_number").notNull(), // For frame-based games, inning/rack number for others
  score: integer("score").notNull(),
  // Legacy fields for Bowlliards compatibility (can be null for other game types)
  isStrike: boolean("is_strike").default(false).notNull(),
  isSpare: boolean("is_spare").default(false).notNull(),
  // Flexible score data - JSON stored as text (replaces ballsPocketed for flexibility)
  // For Bowlliards: [shot1, shot2, shot3] (backward compatible)
  // For other games: game-specific data structure
  scoreData: text("score_data").notNull(), // JSON stored as text
  // Legacy field for backward compatibility (deprecated, use scoreData)
  ballsPocketed: text("balls_pocketed"), // JSON array stored as text (nullable for new games)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game participants table (for multiplayer games)
export const gameParticipants = pgTable("game_participants", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  playerOrder: integer("player_order").notNull(),
  totalScore: integer("total_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Statistics table
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull().unique(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  totalFrames: integer("total_frames").default(0).notNull(),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }).default("0"),
  bestScore: integer("best_score").default(0).notNull(),
  strikes: integer("strikes").default(0).notNull(),
  spares: integer("spares").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NextAuth required tables
export const accounts = pgTable("accounts", {
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  pk: { columns: [table.provider, table.providerAccountId] },
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  pk: { columns: [table.identifier, table.token] },
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  games: many(games),
  gameParticipants: many(gameParticipants),
  statistics: one(statistics),
  plan: one(plans, {
    fields: [users.planId],
    references: [plans.id],
  }),
  subscriptions: many(subscriptions),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  customGame: one(customGames, {
    fields: [games.customGameId],
    references: [customGames.id],
  }),
  frames: many(frames),
  participants: many(gameParticipants),
}));

export const customGamesRelations = relations(customGames, ({ one, many }) => ({
  user: one(users, {
    fields: [customGames.userId],
    references: [users.id],
  }),
  games: many(games),
}));

export const framesRelations = relations(frames, ({ one }) => ({
  game: one(games, {
    fields: [frames.gameId],
    references: [games.id],
  }),
}));

export const gameParticipantsRelations = relations(gameParticipants, ({ one }) => ({
  game: one(games, {
    fields: [gameParticipants.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [gameParticipants.userId],
    references: [users.id],
  }),
}));

export const statisticsRelations = relations(statistics, ({ one }) => ({
  user: one(users, {
    fields: [statistics.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  users: many(users),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

