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
    <li style={{ borderColor: 'var(--color-border)' }}>
      <Link
        href={`/dashboard/games/${game.id}`}
        className="block px-6 py-4 transition-colors"
        style={{ 
          color: 'var(--color-textPrimary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-textPrimary)' }}>
              Game #{game.id} - {game.gameMode}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {new Date(game.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            {game.status}
          </div>
        </div>
      </Link>
    </li>
  );
}

