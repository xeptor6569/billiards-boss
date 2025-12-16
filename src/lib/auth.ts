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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          planId: user.planId,
        };
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

