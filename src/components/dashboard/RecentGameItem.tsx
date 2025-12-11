"use client";

import Link from "next/link";

interface RecentGameItemProps {
  game: {
    id: number;
    gameMode: string;
    status: string;
    createdAt: Date;
  };
}

export default function RecentGameItem({ game }: RecentGameItemProps) {
  return (
    <li className="border-b border-slate-200 dark:border-slate-700">
      <Link
        href={`/dashboard/games/${game.id}`}
        className="block px-6 py-4 transition-colors text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Game #{game.id} - {game.gameMode}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {new Date(game.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {game.status}
          </div>
        </div>
      </Link>
    </li>
  );
}

