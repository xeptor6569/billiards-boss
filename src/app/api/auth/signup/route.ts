import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, plans, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "@/lib/email";

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
    const existingUserResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    const existingUser = existingUserResults[0] || null;

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Get free plan
    const freePlanResults = await db
      .select()
      .from(plans)
      .where(eq(plans.tier, "free"))
      .limit(1);
    
    const freePlan = freePlanResults[0] || null;

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

    // Generate verification token
    const verificationToken = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    // Store verification token
    await db.insert(verificationTokens).values({
      identifier: email,
      token: verificationToken,
      expires,
    });

    // Send verification email (don't fail signup if email fails)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue anyway - user can request resend later
    }

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        userId: newUser[0].id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for database connection errors
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("connect") ||
      errorMessage.includes("database") ||
      (error as any)?.code === "ECONNREFUSED"
    ) {
      return NextResponse.json(
        { error: "Database connection failed. Please ensure the database is running and DATABASE_URL is configured correctly." },
        { status: 500 }
      );
    }
    
    // Check for missing environment variables
    if (errorMessage.includes("DATABASE_URL") || errorMessage.includes("not set")) {
      return NextResponse.json(
        { error: "Database configuration error. Please check your environment variables." },
        { status: 500 }
      );
    }
    
    // Generic error with more context in development
    const detailedError = process.env.NODE_ENV === "development" 
      ? errorMessage 
      : "Internal server error";
    
    return NextResponse.json(
      { error: detailedError },
      { status: 500 }
    );
  }
}

