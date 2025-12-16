import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

// With cacheComponents enabled, routes are dynamic by default
// This route uses request.url which requires runtime evaluation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=missing-token", request.url)
      );
    }

    // Find verification token (identifier is the email for email verification)
    // Exclude password reset tokens (they have "password-reset:" prefix)
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      ),
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid-token", request.url)
      );
    }

    // Ensure this is an email verification token, not a password reset token
    if (verificationToken.identifier.startsWith("password-reset:")) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid-token", request.url)
      );
    }

    // Find user by email (identifier is the email for email verification)
    const user = await db.query.users.findFirst({
      where: eq(users.email, verificationToken.identifier),
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=user-not-found", request.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      // Delete the token anyway
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token));
      
      return NextResponse.redirect(
        new URL("/auth/verify-email?success=already-verified", request.url)
      );
    }

    // Verify email
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));

    return NextResponse.redirect(
      new URL("/auth/verify-email?success=verified", request.url)
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server-error", request.url)
    );
  }
}
