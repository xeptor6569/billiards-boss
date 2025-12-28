"use client";

import HistoryTableRow from "./HistoryTableRow";
import HistoryCard from "./HistoryCard";

interface Game {
  id: number;
  gameMode: string;
  gameType: string;
  gameTypeSequence: number | null;
  status: string;
  createdAt: Date;
  gameState: {
    totalScore: number;
    isComplete: boolean;
  };
  frames?: Array<{
    frameNumber: number;
    ballsPocketed: string;
    score: number;
    isStrike: boolean;
    isSpare: boolean;
  }>;
}

interface HistoryListProps {
  games: Game[];
  showGameType?: boolean;
  gameTypeName?: string;
}

export default function HistoryList({ games, showGameType = false, gameTypeName }: HistoryListProps) {
  // Prepare game data
  const gameData = games.map((game) => {
    const totalScore = game.gameState.totalScore;
    const isActuallyComplete = game.gameState.isComplete || game.status === 'completed';
    const effectiveStatus = isActuallyComplete ? 'completed' : game.status;
    return {
      game: {
        id: game.id,
        gameMode: game.gameMode,
        gameType: game.gameType,
        gameTypeSequence: game.gameTypeSequence,
        status: effectiveStatus,
        createdAt: game.createdAt,
        frames: game.frames || [],
      },
      totalScore,
      gameTypeName: showGameType ? (game as any).gameTypeName : gameTypeName,
    };
  });

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {gameData.map(({ game, totalScore, gameTypeName }) => (
          <div key={game.id}>
            {showGameType && gameTypeName && (
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-1">
                {gameTypeName}
              </div>
            )}
            <HistoryCard
              game={game}
              totalScore={totalScore}
            />
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg shadow-md overflow-hidden bg-slate-50 dark:bg-slate-800">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                {showGameType && (
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Game Type
                  </th>
                )}
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Game #
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  Mode
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Score
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {gameData.map(({ game, totalScore, gameTypeName }) => {
                const gameNumber = game.gameTypeSequence 
                  ? `${game.gameType || 'Game'} #${game.gameTypeSequence}`
                  : `#${game.id}`;
                
                return (
                  <tr key={game.id} className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    {showGameType && gameTypeName && (
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {gameTypeName}
                      </td>
                    )}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {gameNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                      {game.gameMode}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${
                          game.status === "completed" 
                            ? 'bg-green-600 dark:bg-green-400' 
                            : game.status === "abandoned"
                            ? 'bg-slate-500 dark:bg-slate-400'
                            : 'bg-[var(--accent)]'
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {totalScore}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                      <HistoryTableRow game={game} totalScore={totalScore} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

