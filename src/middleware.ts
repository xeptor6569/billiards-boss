import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For now, we'll handle auth checks in the route handlers themselves
  // since auth() doesn't work well in Edge runtime middleware
  // This is a simplified middleware that just allows all requests through
  // Auth checks will be done in the actual route handlers
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

