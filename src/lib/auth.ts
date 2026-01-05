import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { users, accounts, sessions, verificationTokens } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendMagicLinkEmail } from "./email";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Trust the host (required for reverse proxy setups)
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[auth] Missing credentials");
            return null;
          }

          let user;
          try {
            user = await db.query.users.findFirst({
              where: eq(users.email, credentials.email as string),
            });
          } catch (dbError: unknown) {
            console.error("[auth] Database error during user lookup:", dbError);
            // Check for connection errors
            if (
              (dbError as any)?.code === "ECONNREFUSED" ||
              (dbError as any)?.message?.includes("connect") ||
              (dbError as any)?.message?.includes("ECONNREFUSED")
            ) {
              throw new Error(
                "Database connection failed. Please ensure the database is running."
              );
            }
            throw dbError;
          }

          if (!user) {
            console.error(`[auth] User not found: ${credentials.email}`);
            return null;
          }

          if (!user.password) {
            console.error(`[auth] User has no password set: ${credentials.email}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.error(`[auth] Invalid password for: ${credentials.email}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            planId: user.planId,
          };
        } catch (error: unknown) {
          console.error("[auth] Error in authorize function:", error);
          // Re-throw to let NextAuth handle it properly
          throw error;
        }
      },
    }),
    Email({
      // Provide minimal server config (required by NextAuth, but we use custom sendVerificationRequest)
      server: {
        host: "smtp.resend.com",
        port: 587,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY || "dummy",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@billiardsboss.com",
      // Override with our custom email sending using Resend
      sendVerificationRequest: async ({ identifier, url }) => {
        try {
          await sendMagicLinkEmail(identifier, url);
        } catch (error) {
          console.error("Error sending magic link email:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in for Email provider
      if (account?.provider === "email") {
        return true;
      }
      // Allow sign in for Credentials provider
      if (account?.provider === "credentials") {
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.planId = (user as any).planId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).planId = token.planId as number | null;
      }
      return session;
    },
  },
});

