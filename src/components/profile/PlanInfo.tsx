interface PlanInfoProps {
  plan?: {
    id: number;
    name: string;
    tier: string;
    maxGames: number | null;
    allowsMultiplayer: boolean;
    allowsTournaments: boolean;
    price: string | null;
  } | null;
}

export default function PlanInfo({ plan }: PlanInfoProps) {
  if (!plan) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
        <p className="text-slate-600 dark:text-slate-400">
          No plan information available.
        </p>
      </div>
    );
  }

  const isFree = plan.tier === "free" || plan.price === null;
  const maxGamesText = plan.maxGames === null ? "Unlimited" : plan.maxGames.toString();

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {plan.name}
        </h3>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--accent)] text-white">
          {plan.tier.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Max Games</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {maxGamesText}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Multiplayer</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {plan.allowsMultiplayer ? (
              <span className="text-green-600 dark:text-green-400">Enabled</span>
            ) : (
              <span className="text-slate-400">Disabled</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Tournaments</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {plan.allowsTournaments ? (
              <span className="text-green-600 dark:text-green-400">Enabled</span>
            ) : (
              <span className="text-slate-400">Disabled</span>
            )}
          </span>
        </div>

        {!isFree && plan.price && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Price</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ${parseFloat(plan.price).toFixed(2)}/month
            </span>
          </div>
        )}
      </div>

      {isFree && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upgrade to unlock premium features and support the development of
            Billiards Boss!
          </p>
        </div>
      )}
    </div>
  );
}
