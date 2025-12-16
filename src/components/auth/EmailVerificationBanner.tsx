"use client";

import { useState } from "react";
import Link from "next/link";

interface EmailVerificationBannerProps {
  email: string;
  isVerified: boolean;
}

export default function EmailVerificationBanner({
  email,
  isVerified,
}: EmailVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (isVerified) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to send verification email",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Verification email sent! Please check your inbox.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              Please verify your email address ({email}) to access all features. Check your inbox for the verification email.
            </p>
          </div>
          {message && (
            <div className={`mt-2 text-sm ${
              message.type === "success"
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}>
              {message.text}
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            <Link
              href="/auth/verify-email"
              className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
