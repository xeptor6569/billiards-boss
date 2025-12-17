import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const { GET, POST } = handlers;

// Handle HEAD requests from email scanners (e.g., Outlook SafeLink)
// This prevents email scanners from consuming the magic link token
export async function HEAD(request: NextRequest) {
  // Return 200 OK without processing the request
  // This allows email scanners to verify the link exists without consuming it
  return new Response(null, { status: 200 });
}

