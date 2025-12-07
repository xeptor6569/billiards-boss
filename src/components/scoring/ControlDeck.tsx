"use client";

import { Frame } from "@/lib/game-logic";
import { useState } from "react";

interface ControlDeckProps {
  isShot1: boolean;
  isShot2: boolean;
  remainingBalls: number;
  onBallPocketed: (count: number) => void;
  disabled?: boolean;
  currentFrame?: Frame;
}

export default function ControlDeck({
  isShot1,
  isShot2,
  remainingBalls,
  onBallPocketed,
  disabled = false,
  currentFrame,
}: ControlDeckProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStrike = () => {
    if (disabled || !isShot1) return;
    setIsAnimating(true);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    onBallPocketed(10);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSpare = () => {
    if (disabled || !isShot2) return;
    setIsAnimating(true);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    onBallPocketed(remainingBalls);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNumberClick = (num: number) => {
    if (disabled) return;
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onBallPocketed(num);
  };

  const handleMiss = () => {
    if (disabled) return;
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onBallPocketed(0);
  };

  // Determine max number for shot 2
  // For shot 1: show 0-9
  // For shot 2: show 0 through remainingBalls (max 9)
  const maxNumber = isShot1 ? 9 : Math.min(remainingBalls, 9);
  const numbers = Array.from({ length: maxNumber + 1 }, (_, i) => i);
  
  // Don't show 0 in the grid if it's shot 2 (show it as miss button instead)
  const gridNumbers = isShot1 ? numbers : numbers.filter(n => n > 0);

  return (
    <div className="h-full flex flex-col p-4 gap-4" style={{ backgroundColor: "#09090b" }}>
      {/* Number Grid */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        {gridNumbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className="rounded-xl text-4xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{
              backgroundColor: "#18181b",
              border: "2px solid #27272a",
              color: "#f4f4f5",
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.backgroundColor = "#27272a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#18181b";
            }}
            onTouchStart={(e) => {
              if (!disabled) e.currentTarget.style.backgroundColor = "#3f3f46";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = "#18181b";
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Big Action Button */}
      {isShot1 && (
        <button
          type="button"
          onClick={handleStrike}
          disabled={disabled}
          className={`
            w-full h-20 rounded-xl text-2xl font-bold
            shadow-lg transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-manipulation
            ${isAnimating ? "animate-pulse scale-95" : ""}
          `}
          style={{
            backgroundColor: "#22c55e",
            color: "#f4f4f5",
            boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#16a34a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#22c55e";
          }}
          onTouchStart={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#15803d";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.backgroundColor = "#22c55e";
          }}
        >
          STRIKE (10)
        </button>
      )}

      {isShot2 && remainingBalls > 0 && (
        <button
          type="button"
          onClick={handleSpare}
          disabled={disabled}
          className={`
            w-full h-20 rounded-xl text-2xl font-bold
            shadow-lg transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-manipulation
            ${isAnimating ? "animate-pulse scale-95" : ""}
          `}
          style={{
            backgroundColor: "#06b6d4",
            color: "#f4f4f5",
            boxShadow: "0 10px 15px -3px rgba(6, 182, 212, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#0891b2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#06b6d4";
          }}
          onTouchStart={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#0e7490";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.backgroundColor = "#06b6d4";
          }}
        >
          SPARE ({remainingBalls})
        </button>
      )}

      {/* Miss button for shot 2 */}
      {isShot2 && (
        <button
          type="button"
          onClick={handleMiss}
          disabled={disabled}
          className="w-full h-12 rounded-lg text-lg font-semibold disabled:opacity-50 touch-manipulation"
          style={{
            backgroundColor: "#dc2626",
            color: "#f4f4f5",
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#b91c1c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc2626";
          }}
          onTouchStart={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "#991b1b";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.backgroundColor = "#dc2626";
          }}
        >
          MISS (0)
        </button>
      )}
    </div>
  );
}

