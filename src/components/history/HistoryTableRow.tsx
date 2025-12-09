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
    <tr 
      className="transition-colors"
      style={{ borderColor: 'var(--color-border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
        #{game.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {game.gameMode}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
          style={{
            backgroundColor: game.status === "completed" 
              ? 'var(--color-success)' 
              : 'var(--color-accent)',
            color: '#ffffff'
          }}
        >
          {game.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-textPrimary)' }}>
        {totalScore}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-textSecondary)' }}>
        {new Date(game.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          href={`/dashboard/games/${game.id}`}
          className="transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          View
        </Link>
      </td>
    </tr>
  );
}

