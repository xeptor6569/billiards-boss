import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppNavigation from "@/components/layout/AppNavigation";

async function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <AppNavigation>
      {children}
    </AppNavigation>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      <ProtectedAppShell>
        {children}
      </ProtectedAppShell>
    </Suspense>
  );
}

