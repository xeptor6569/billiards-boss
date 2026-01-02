import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthCheck() {
  try {
    const session = await auth();
    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    // Handle JWT errors gracefully (e.g., when switching between domains)
    // This can happen when a JWT token from one domain (dev.billiardsboss.com)
    // is used on another domain (localhost:3000) - the token can't be decrypted
    // In this case, just return null and let the user sign in again
    console.warn("[AuthCheck] Session error (likely domain mismatch):", error);
  }
  return null;
}
