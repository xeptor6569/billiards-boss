import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// API routes are inherently dynamic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Return success even for invalid emails to prevent enumeration
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Rate limiting (check before user lookup to prevent enumeration)
    const rateLimit = checkRateLimit(`password-reset:${email.toLowerCase().trim()}`);
    if (!rateLimit.allowed) {
      // Return generic message even on rate limit to prevent enumeration
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    // Return success even if user doesn't exist (prevent email enumeration)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Check for existing valid token
    const existingToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, `password-reset:${user.email}`),
        gt(verificationTokens.expires, new Date())
      ),
    });

    if (existingToken) {
      // Token already exists, don't send another email
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    // Delete any old tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `password-reset:${user.email}`));

    // Create new token
    await db.insert(verificationTokens).values({
      identifier: `password-reset:${user.email}`,
      token,
      expires,
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Delete the token if email failed
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token));
      
      return NextResponse.json(
        { error: "Failed to send password reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
