import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Get free plan
    const freePlan = await db.query.plans.findFirst({
      where: eq(plans.tier, "free"),
    });

    if (!freePlan) {
      return NextResponse.json(
        { error: "Free plan not found. Please seed the database." },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: nanoid(),
        email,
        name: name || null,
        password: hashedPassword,
        planId: freePlan.id,
      })
      .returning();

    return NextResponse.json(
      { message: "User created successfully", userId: newUser[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

