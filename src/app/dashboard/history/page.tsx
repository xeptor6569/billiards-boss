import { redirect } from "next/navigation";
import { getStandardGameTypes } from "@/lib/game-types";
import GameTypeCard from "@/components/dashboard/GameTypeCard";
import Link from "next/link";

export default function HistoryPage() {
  const gameTypes = getStandardGameTypes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Game History
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Select a game type to view its history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gameTypes.map((gameType) => (
          <GameTypeCard
            key={gameType.id}
            gameType={gameType}
          />
        ))}
      </div>
    </div>
  );
}
