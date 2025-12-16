import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordChangeForm from "@/components/profile/PasswordChangeForm";
import PlanInfo from "@/components/profile/PlanInfo";
import AccountSettings from "@/components/profile/AccountSettings";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch full user data with relations
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      plan: true,
      statistics: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Profile Settings
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage your account information and preferences.
        </p>
      </div>

      {!user.emailVerified && (
        <EmailVerificationBanner email={user.email} isVerified={false} />
      )}

      <div className="space-y-8">
        {/* Account Information */}
        <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Account Information
          </h2>
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Account Created:
                </span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Email Verified:
                </span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {user.emailVerified ? (
                    <span className="text-green-600 dark:text-green-400">
                      Verified
                    </span>
                  ) : (
                    <span className="text-slate-400">Not verified</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <ProfileForm initialName={user.name} initialEmail={user.email} />
        </section>

        {/* Security */}
        <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Security
          </h2>
          <PasswordChangeForm />
        </section>

        {/* Plan & Subscription */}
        <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Plan & Subscription
          </h2>
          <PlanInfo plan={user.plan || null} />
        </section>

        {/* Account Settings */}
        <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Account Settings
          </h2>
          <AccountSettings />
        </section>
      </div>
    </div>
  );
}
