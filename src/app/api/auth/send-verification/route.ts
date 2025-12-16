import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// API routes are inherently dynamic
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(`verification:${user.email}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check for existing valid token
    const existingToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, user.email),
        gt(verificationTokens.expires, new Date())
      ),
    });

    if (existingToken) {
      // Token already exists and is valid, don't send another email
      // But return success to prevent email enumeration
      return NextResponse.json({
        message: "If your email is not verified, a verification email has been sent.",
      });
    }

    // Generate new verification token
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    // Delete any old tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, user.email));

    // Create new token
    await db.insert(verificationTokens).values({
      identifier: user.email,
      token,
      expires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, token);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Delete the token if email failed
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token));
      
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
