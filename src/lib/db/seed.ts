import "dotenv/config";
import { db } from "./index";
import { plans } from "./schema";
import { eq } from "drizzle-orm";

export async function seedPlans() {
  // Check if plans already exist
  const existingPlans = await db.query.plans.findMany();
  
  if (existingPlans.length > 0) {
    console.log("Plans already exist, skipping seed");
    return { freePlan: existingPlans[0], premiumPlan: existingPlans[1] };
  }

  // Seed default free plan
  const [freePlan] = await db.insert(plans).values({
    name: "Free",
    tier: "free",
    maxGames: 10, // Limited to 10 games for free users
    allowsMultiplayer: false,
    allowsTournaments: false,
    price: null,
  }).returning();

  // Seed premium plan (for future use)
  const [premiumPlan] = await db.insert(plans).values({
    name: "Premium",
    tier: "premium",
    maxGames: null, // Unlimited
    allowsMultiplayer: true,
    allowsTournaments: true,
    price: "9.99",
  }).returning();

  console.log("Seeded plans:", { freePlan, premiumPlan });
  return { freePlan, premiumPlan };
}

// Run seed if called directly
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log("Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

