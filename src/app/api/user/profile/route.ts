import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// API routes are inherently dynamic and don't need explicit dynamic export
export async function GET() {
  try {
    // During build/prerender, auth() may fail because headers() isn't available
    // This is expected and safe to ignore - API routes are never actually prerendered
    let session;
    try {
      session = await auth();
    } catch (authError: any) {
      // If this is a prerender/build-time error, return a safe response
      if (
        authError?.message?.includes("prerender") ||
        authError?.message?.includes("headers()")
      ) {
        // During build, return a placeholder response
        // This route will work correctly at runtime
        return NextResponse.json(
          { error: "This route requires authentication at runtime" },
          { status: 401 }
        );
      }
      throw authError;
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        plan: true,
        statistics: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // During build/prerender, auth() may fail because headers() isn't available
    // This is expected and safe to ignore - API routes are never actually prerendered
    let session;
    try {
      session = await auth();
    } catch (authError: any) {
      // If this is a prerender/build-time error, return a safe response
      if (
        authError?.message?.includes("prerender") ||
        authError?.message?.includes("headers()")
      ) {
        // During build, return a placeholder response
        // This route will work correctly at runtime
        return NextResponse.json(
          { error: "This route requires authentication at runtime" },
          { status: 401 }
        );
      }
      throw authError;
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: { name?: string; email?: string; updatedAt?: Date } = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name || null;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return updated user without password
    const { password, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
