"use client";

import Link from "next/link";

interface HistoryTableRowProps {
  game: {
    id: number;
    gameMode: string;
    status: string;
    createdAt: Date;
    frames?: Array<{
      frameNumber: number;
      ballsPocketed: string;
      score: number;
      isStrike: boolean;
      isSpare: boolean;
    }>;
  };
  totalScore: number;
}

export default function HistoryTableRow({ game, totalScore }: HistoryTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
        #{game.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {game.gameMode}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${
            game.status === "completed" 
              ? 'bg-green-600 dark:bg-green-400' 
              : 'bg-[var(--accent)]'
          }`}
        >
          {game.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
        {totalScore}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {new Date(game.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          href={`/dashboard/games/${game.id}`}
          className="transition-opacity hover:opacity-80 text-[var(--accent)]"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

