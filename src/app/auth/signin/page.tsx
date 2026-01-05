"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/auth/PasswordInput";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMethod, setAuthMethod] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
    if (searchParams.get("password-reset") === "true") {
      setSuccess("Password reset successfully! Please sign in with your new password.");
    }
  }, [searchParams]);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // More specific error messages
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError("An error occurred during sign in. Please try again.");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // NextAuth Email provider will redirect to verifyRequest page after sending email
      // The callbackUrl is where the user will be redirected AFTER clicking the magic link
      await signIn("email", {
        email,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-lg p-8 shadow-xl bg-slate-50 dark:bg-slate-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sign in to Billiards Boss
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium transition-opacity hover:opacity-80 text-[var(--accent)]"
            >
              Sign up free
            </Link>
          </p>
        </div>
        <div className="mt-6 flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              authMethod === "password"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("magic-link");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              authMethod === "magic-link"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Magic Link
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={authMethod === "password" ? handlePasswordSignIn : handleMagicLinkSignIn}>
          {error && (
            <div className="rounded-md p-4 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md p-4 bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:z-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                placeholder="Email address"
              />
            </div>
            {authMethod === "password" && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            >
              {loading 
                ? (authMethod === "password" ? "Signing in..." : "Sending...")
                : (authMethod === "password" ? "Sign in" : "Send Magic Link")
              }
            </button>
            {authMethod === "password" && (
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8 rounded-lg p-8 shadow-xl bg-slate-50 dark:bg-slate-800">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sign in to Billiards Boss
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

