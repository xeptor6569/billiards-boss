"use client";

import { useState } from "react";

interface APA9BallBreakDeterminationProps {
  player1Name: string;
  player2Name: string;
  onConfirm: (breakPlayer: 1 | 2) => void;
  onCancel: () => void;
}

type BreakMethod = "coin" | "lag" | null;
type CoinResult = "heads" | "tails" | null;

export default function APA9BallBreakDetermination({
  player1Name,
  player2Name,
  onConfirm,
  onCancel,
}: APA9BallBreakDeterminationProps) {
  const [breakMethod, setBreakMethod] = useState<BreakMethod>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<CoinResult>(null);
  const [breakPlayer, setBreakPlayer] = useState<1 | 2 | null>(null);

  const handleCoinFlip = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setCoinResult(null);
    
    // Animate for 1.5 seconds, then show result
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);
      // Assign heads to Player 1, tails to Player 2
      setBreakPlayer(result === "heads" ? 1 : 2);
      setIsFlipping(false);
    }, 1500);
  };

  const handleLagSelect = (player: 1 | 2) => {
    setBreakPlayer(player);
  };

  const handleProceed = () => {
    if (breakPlayer) {
      onConfirm(breakPlayer);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Determine Who Breaks
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Choose how to determine who breaks first.
        </p>

        {!breakMethod && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setBreakMethod("coin")}
              className="w-full py-4 px-4 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20" />
              </svg>
              Coin Flip
            </button>
            <button
              onClick={() => setBreakMethod("lag")}
              className="w-full py-4 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path d="M3 12h18M3 12l4-4m-4 4l4 4m14-4l-4-4m4 4l-4 4" />
              </svg>
              Lag
            </button>
          </div>
        )}

        {breakMethod === "coin" && (
          <div className="mb-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="perspective-1000">
                <button
                  onClick={handleCoinFlip}
                  disabled={isFlipping || coinResult !== null}
                  className={`
                    relative w-32 h-32 rounded-full transition-all duration-300
                    ${isFlipping || coinResult !== null
                      ? "cursor-not-allowed opacity-75"
                      : "cursor-pointer hover:scale-105 active:scale-95"
                    }
                    ${coinResult === "heads"
                      ? "bg-amber-400"
                      : coinResult === "tails"
                      ? "bg-slate-400"
                      : "bg-amber-500"
                    }
                    shadow-lg preserve-3d
                  `}
                  style={{
                    transform: isFlipping
                      ? "rotateY(1800deg)"
                      : coinResult === "heads"
                      ? "rotateY(0deg)"
                      : coinResult === "tails"
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                    transition: isFlipping
                      ? "transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
                      : "transform 0.3s ease-in-out",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center backface-hidden">
                    {coinResult === null && !isFlipping && (
                      <span className="text-white text-4xl font-bold">?</span>
                    )}
                    {coinResult === "heads" && (
                      <span className="text-white text-2xl font-bold">H</span>
                    )}
                    {coinResult === "tails" && (
                      <span className="text-white text-2xl font-bold" style={{ opacity: 0 }}>T</span>
                    )}
                  </div>
                  <div 
                    className="absolute inset-0 flex items-center justify-center backface-hidden"
                    style={{
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {coinResult === "tails" && (
                      <span className="text-white text-2xl font-bold">T</span>
                    )}
                    {coinResult === "heads" && (
                      <span className="text-white text-2xl font-bold" style={{ opacity: 0 }}>H</span>
                    )}
                  </div>
                </button>
              </div>
              {!coinResult && !isFlipping && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Click the coin to flip
                </p>
              )}
              {isFlipping && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 animate-pulse">
                  Flipping...
                </p>
              )}
              {coinResult && breakPlayer && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {coinResult === "heads" ? "Heads" : "Tails"} wins!
                  </p>
                  <p className="text-base text-slate-700 dark:text-slate-300 mt-2">
                    {breakPlayer === 1 ? player1Name : player2Name} breaks
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {breakMethod === "lag" && (
          <div className="mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
              Who won the lag?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleLagSelect(1)}
                className={`
                  w-full py-4 px-4 rounded-lg font-semibold transition-all
                  ${breakPlayer === 1
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {player1Name}
              </button>
              <button
                onClick={() => handleLagSelect(2)}
                className={`
                  w-full py-4 px-4 rounded-lg font-semibold transition-all
                  ${breakPlayer === 2
                    ? "bg-red-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {player2Name}
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (breakMethod) {
                setBreakMethod(null);
                setCoinResult(null);
                setBreakPlayer(null);
                setIsFlipping(false);
              } else {
                onCancel();
              }
            }}
            className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {breakMethod ? "Back" : "Cancel"}
          </button>
          {breakPlayer && (
            <button
              onClick={handleProceed}
              className="flex-1 py-3 px-4 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

