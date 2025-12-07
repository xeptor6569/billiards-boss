import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Suspense } from "react";

async function DashboardNav() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/dashboard"
              className="flex items-center px-2 py-2 text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              Billiards Boss
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/games/new"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                New Game
              </Link>
              <Link
                href="/dashboard/history"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                History
              </Link>
              <Link
                href="/dashboard/stats"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Statistics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">
              {session.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut();
                redirect("/");
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <nav className="bg-white shadow-sm dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Billiards Boss
              </div>
            </div>
          </div>
        </nav>
      }>
        <DashboardNav />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}

