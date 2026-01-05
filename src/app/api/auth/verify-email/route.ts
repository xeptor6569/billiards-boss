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
  // During build/prerender, request.url may not be available, so we catch errors
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
    // During build/prerender, request.url may throw - fall through to Host header
  }
  
  // Fallback to Host header, but filter out localhost/0.0.0.0
  const host = request.headers.get("host");
  if (host && 
      !host.includes("0.0.0.0") && 
      !host.includes("127.0.0.1") && 
      !host.startsWith("localhost") &&
      host !== "localhost") {
    try {
      const protocol = request.headers.get("x-forwarded-proto") || 
                       (request.url?.startsWith("https") ? "https" : "http");
      return `${protocol}://${host}`;
    } catch {
      // If request.url is not available, default to https for production, http for dev
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      return `${protocol}://${host}`;
    }
  }
  
  // If all else fails, return a safe default
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  try {
    // During build/prerender, request.url may not be available
    // This route is dynamic by default in Next.js 16, but we need to handle build-time gracefully
    let requestUrl: string;
    try {
      requestUrl = request.url;
    } catch (error: any) {
      // During build/prerender, return a safe response
      if (error?.message?.includes("prerender") || error?.message?.includes("request.url")) {
        return NextResponse.json(
          { error: "This route requires runtime execution" },
          { status: 400 }
        );
      }
      throw error;
    }

    const baseUrl = getBaseUrl(request);
    console.log("Verification request:", { 
      baseUrl, 
      requestUrl,
      host: request.headers.get("host"),
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL 
    });
    
    const { searchParams } = new URL(requestUrl);
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
