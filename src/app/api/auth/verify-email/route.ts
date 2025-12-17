import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

// Helper to get base URL from request
function getBaseUrl(request: NextRequest): string {
  // Prefer NEXT_PUBLIC_APP_URL if set (most reliable)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Try to extract from request.url first (most accurate for the actual request)
  try {
    const url = new URL(request.url);
    // Only use if it's a valid external URL (not localhost/0.0.0.0/127.0.0.1)
    if (!url.host.includes("0.0.0.0") && 
        !url.host.includes("127.0.0.1") && 
        !url.host.startsWith("localhost") &&
        url.host !== "localhost") {
      return `${url.protocol}//${url.host}`;
    }
  } catch {
    // Fall through to Host header
  }
  
  // Fallback to Host header, but filter out localhost/0.0.0.0
  const host = request.headers.get("host");
  if (host && 
      !host.includes("0.0.0.0") && 
      !host.includes("127.0.0.1") && 
      !host.startsWith("localhost") &&
      host !== "localhost") {
    const protocol = request.headers.get("x-forwarded-proto") || 
                     (request.url.startsWith("https") ? "https" : "http");
    return `${protocol}://${host}`;
  }
  
  // If all else fails, return a safe default
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// With cacheComponents enabled, routes are dynamic by default
// This route uses request.url which requires runtime evaluation
export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request);
    console.log("Verification request:", { 
      baseUrl, 
      requestUrl: request.url,
      host: request.headers.get("host"),
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL 
    });
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=missing-token", baseUrl)
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
      console.error("Verification token not found or expired:", { token, baseUrl });
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid-token", baseUrl)
      );
    }

    // Ensure this is an email verification token, not a password reset token
    if (verificationToken.identifier.startsWith("password-reset:")) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid-token", baseUrl)
      );
    }

    // Find user by email (identifier is the email for email verification)
    const user = await db.query.users.findFirst({
      where: eq(users.email, verificationToken.identifier),
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=user-not-found", baseUrl)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      // Delete the token anyway
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token));
      
      return NextResponse.redirect(
        new URL("/auth/verify-email?success=already-verified", baseUrl)
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
      new URL("/auth/verify-email?success=verified", baseUrl)
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server-error", baseUrl)
    );
  }
}
