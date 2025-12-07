"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try again
        </button>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 text-left text-sm bg-gray-100 p-4 rounded">
            {error.message}
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}

