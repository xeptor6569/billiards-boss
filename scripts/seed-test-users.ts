import "dotenv/config";
import { db } from "../src/lib/db";
import { users, plans } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function seedTestUsers() {
  try {
    // Get free plan
    const freePlan = await db.query.plans.findFirst({
      where: eq(plans.tier, "free"),
    });

    if (!freePlan) {
      console.error("Free plan not found. Please run 'npm run db:seed' first.");
      process.exit(1);
    }

    // Get premium plan
    const premiumPlan = await db.query.plans.findFirst({
      where: eq(plans.tier, "premium"),
    });

    if (!premiumPlan) {
      console.error("Premium plan not found. Please run 'npm run db:seed' first.");
      process.exit(1);
    }

    // Test users to create
    const testUsers = [
      {
        email: "test@example.com",
        password: "test123",
        name: "Test User",
        planId: freePlan.id,
      },
      {
        email: "premium@example.com",
        password: "premium123",
        name: "Premium User",
        planId: premiumPlan.id,
      },
      {
        email: "user1@test.com",
        password: "password123",
        name: "User One",
        planId: freePlan.id,
      },
      {
        email: "user2@test.com",
        password: "password123",
        name: "User Two",
        planId: freePlan.id,
      },
    ];

    console.log("Seeding test users...");

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          id: nanoid(),
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          planId: userData.planId,
          emailVerified: new Date(), // Auto-verify test users
        })
        .returning();

      console.log(`✅ Created user: ${userData.email} (${userData.name})`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Plan: ${userData.planId === freePlan.id ? "Free" : "Premium"}`);
    }

    console.log("\n✅ Test users seeded successfully!");
    console.log("\nYou can now sign in with:");
    testUsers.forEach((user) => {
      console.log(`  - ${user.email} / ${user.password}`);
    });
  } catch (error: unknown) {
    console.error("Error seeding test users:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUsers()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export { seedTestUsers };

