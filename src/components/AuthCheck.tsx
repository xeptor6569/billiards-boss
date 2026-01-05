import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthCheck() {
  try {
    const session = await auth();
    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    // During prerendering, auth() may fail because headers() isn't available
    // This is expected and safe to ignore - the component will work correctly at runtime
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("prerender") ||
      errorMessage.includes("headers()") ||
      errorMessage.includes("HANGING_PROMISE_REJECTION")
    ) {
      // Silently ignore prerender errors - this is expected behavior
      return null;
    }
    // Handle other errors (e.g., JWT errors when switching between domains)
    // This can happen when a JWT token from one domain (dev.billiardsboss.com)
    // is used on another domain (localhost:3000) - the token can't be decrypted
    // In this case, just return null and let the user sign in again
    console.warn("[AuthCheck] Session error (likely domain mismatch):", error);
  }
  return null;
}
