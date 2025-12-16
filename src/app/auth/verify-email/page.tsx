"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const errorParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  useEffect(() => {
    if (errorParam === "invalid-token") {
      setError("Invalid or expired verification token. Please request a new verification email.");
    } else if (errorParam === "missing-token") {
      setError("Verification token is missing. Please check your email and use the link provided.");
    } else if (errorParam === "user-not-found") {
      setError("User not found. Please contact support if this issue persists.");
    } else if (errorParam === "server-error") {
      setError("An error occurred during verification. Please try again.");
    }

    if (successParam === "verified") {
      setSuccess("Email verified successfully! You can now sign in.");
    } else if (successParam === "already-verified") {
      setSuccess("Your email is already verified. You can sign in.");
    }
  }, [errorParam, successParam]);

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification email");
        return;
      }

      setSuccess("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-lg p-8 shadow-xl bg-slate-50 dark:bg-slate-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Verify your email address to complete your account setup
          </p>
        </div>

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

        {!error && !success && (
          <div className="space-y-4">
            <p className="text-center text-slate-600 dark:text-slate-400">
              We've sent a verification email to your inbox. Please click the link in the email to verify your account.
            </p>
            <p className="text-center text-sm text-slate-500 dark:text-slate-500">
              Didn't receive the email? Check your spam folder or request a new verification email.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full px-4 py-2 rounded-md font-medium text-white bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          <Link
            href="/auth/signin"
            className="block text-center text-sm text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
