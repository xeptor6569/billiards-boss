"use client";

import { useRouter } from "next/navigation";
import { GameState, Frame } from "@/lib/game-logic";
import FrameDisplay from "./FrameDisplay";
import ShareGame from "@/components/sharing/ShareGame";

interface GameSummaryProps {
  gameState: GameState;
  gameId: number;
  createdAt: string;
  gameMode?: string;
}

// Calculate cumulative score up to a given frame index
// This properly handles strike/spare bonuses by looking ahead
function calculateCumulativeScore(frames: Frame[], upToIndex: number): number {
  if (upToIndex < 0 || upToIndex >= frames.length) return 0;
  
  let total = 0;
  
  for (let i = 0; i <= upToIndex; i++) {
    const frame = frames[i];
    const isTenthFrame = frame.frameNumber === 10;
    let frameScore = frame.score;
    
    // For 10th frame, score is just the sum of all balls (no bonus needed)
    if (isTenthFrame) {
      total += frameScore;
      continue;
    }
    
    // Add strike bonus (next 2 balls)
    if (frame.isStrike && i < frames.length - 1) {
      const nextFrame = frames[i + 1];
      if (nextFrame.ballsPocketed.length >= 2) {
        frameScore += nextFrame.ballsPocketed[0] + nextFrame.ballsPocketed[1];
      } else if (nextFrame.ballsPocketed.length >= 1 && i < frames.length - 2) {
        // Need to look at frame after next
        const frameAfterNext = frames[i + 2];
        frameScore += nextFrame.ballsPocketed[0] + (frameAfterNext.ballsPocketed[0] || 0);
      }
    }
    // Add spare bonus (next 1 ball)
    else if (frame.isSpare && i < frames.length - 1) {
      const nextFrame = frames[i + 1];
      if (nextFrame.ballsPocketed.length >= 1) {
        frameScore += nextFrame.ballsPocketed[0];
      }
    }
    
    total += frameScore;
  }
  
  return total;
}

export default function GameSummary({ gameState, gameId, createdAt, gameMode }: GameSummaryProps) {
  const router = useRouter();
  const strikes = gameState.frames.filter(f => f.isStrike).length;
  const spares = gameState.frames.filter(f => f.isSpare && !f.isStrike).length;
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Total Score</div>
          <div className="text-3xl font-black text-[var(--accent)]">{gameState.totalScore}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Strikes</div>
          <div className="text-3xl font-black text-amber-500">{strikes}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Spares</div>
          <div className="text-3xl font-black text-green-600 dark:text-green-400">{spares}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Date</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formattedDate}</div>
        </div>
      </div>

      {/* Scoresheet */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Scoresheet</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
          {gameState.frames.map((frame, index) => {
            const cumulativeScore = calculateCumulativeScore(gameState.frames, index);
            return (
              <FrameDisplay
                key={frame.frameNumber}
                frame={frame}
                isCurrent={false}
                cumulativeScore={cumulativeScore}
                isEditable={false}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <ShareGame
          gameState={gameState}
          gameId={gameId}
          createdAt={createdAt}
          gameMode={gameMode}
        />
        <button
          onClick={() => router.push("/dashboard/games/new")}
          className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          Start New Game
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

