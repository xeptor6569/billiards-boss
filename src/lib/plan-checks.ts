import { db } from "./db";
import { users, plans, games } from "./db/schema";
import { eq, and, count } from "drizzle-orm";

export async function checkGameLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  gamesCount?: number;
  maxGames?: number | null;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { plan: true },
  });

  if (!user || !user.planId) {
    return { allowed: false, reason: "No plan assigned" };
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, user.planId),
  });

  if (!plan) {
    return { allowed: false, reason: "Plan not found" };
  }

  // If maxGames is null, unlimited
  if (plan.maxGames === null) {
    return { allowed: true, gamesCount: 0, maxGames: null };
  }

  // Count user's games
  const gamesCount = await db
    .select({ count: count() })
    .from(games)
    .where(and(eq(games.userId, userId), eq(games.status, "completed")));

  const countValue = gamesCount[0]?.count || 0;

  if (countValue >= plan.maxGames) {
    return {
      allowed: false,
      reason: `Game limit reached (${countValue}/${plan.maxGames})`,
      gamesCount: countValue,
      maxGames: plan.maxGames,
    };
  }

  return {
    allowed: true,
    gamesCount: countValue,
    maxGames: plan.maxGames,
  };
}

export async function checkMultiplayerAccess(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { plan: true },
  });

  if (!user || !user.planId) {
    return false;
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, user.planId),
  });

  return plan?.allowsMultiplayer || false;
}

export async function checkTournamentAccess(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { plan: true },
  });

  if (!user || !user.planId) {
    return false;
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, user.planId),
  });

  return plan?.allowsTournaments || false;
}

