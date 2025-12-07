"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Something went wrong!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an error while loading this page. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Go to Dashboard
          </a>
        </div>
        {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_ERRORS === "true") && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
              Error Details
            </summary>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-64">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

