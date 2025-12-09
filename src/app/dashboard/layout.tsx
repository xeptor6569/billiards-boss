import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppNavigation from "@/components/layout/AppNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

