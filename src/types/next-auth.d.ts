import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      planId?: number | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    planId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    planId?: number | null;
  }
}

