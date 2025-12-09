"use client";

import { useEffect, useState } from "react";

interface InputKeypadProps {
  mode: "shot1" | "shot2" | "break";
  remainingBalls: number;
  onInput: (value: number) => void;
  disabled?: boolean;
}

export default function InputKeypad({ mode, remainingBalls, onInput, disabled }: InputKeypadProps) {
  const [activeKey, setActiveKey] = useState<number | string | null>(null);

  const handlePress = (val: number | string) => {
    if (disabled) return;
    setActiveKey(val);
    
    // Haptic
    if (navigator.vibrate) navigator.vibrate(50);

    // Process input
    if (typeof val === "number") {
      onInput(val);
    } else if (val === "X") {
      onInput(10);
    } else if (val === "/") {
      onInput(remainingBalls); // Spare = remaining
    } else if (val === "MISS") {
      onInput(0);
    }
    
    setTimeout(() => setActiveKey(null), 150);
  };

  const btnBase = "relative flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 touch-manipulation select-none";
  const btnSurface = "bg-[var(--game-surface)] border-2 border-[var(--game-border)] text-[var(--game-text-primary)]";
  const btnAction = "text-white shadow-lg";

  // Grid generation
  const maxVal = mode === "shot2" ? Math.min(remainingBalls, 9) : 9;
  const numbers = Array.from({ length: 10 }, (_, i) => i); // 0-9

  return (
    <div className="flex flex-col gap-3 h-full p-4 pb-6">
      
      {/* Primary Action Button Area (30% height) */}
      <div className="h-[30%] min-h-[80px]">
        {mode === "shot1" || mode === "break" ? (
          <button
            onClick={() => handlePress("X")}
            className={`${btnBase} ${btnAction} w-full h-full text-3xl tracking-widest bg-[var(--game-strike)] shadow-[var(--game-strike)]/30`}
          >
            STRIKE
          </button>
        ) : (
          <div className="flex gap-3 h-full">
            {remainingBalls > 0 && (
              <button
                onClick={() => handlePress("/")}
                className={`${btnBase} ${btnAction} flex-1 text-2xl bg-[var(--game-spare)] shadow-[var(--game-spare)]/30`}
              >
                SPARE
              </button>
            )}
            <button
              onClick={() => handlePress("MISS")}
              className={`${btnBase} ${btnAction} ${remainingBalls > 0 ? "w-[30%]" : "w-full"} text-xl bg-[var(--game-miss)] shadow-[var(--game-miss)]/30`}
            >
              MISS
            </button>
          </div>
        )}
      </div>

      {/* Number Grid Area (Remaining height) */}
      <div className="flex-1 grid grid-cols-5 gap-2">
        {numbers.map((num) => {
          const isValid = num <= maxVal && (mode !== "shot2" || num < remainingBalls); // shot2 nums must be < remaining (since = remaining is a spare) or 0 (miss is separate)
          // Actually, for shot 2, we usually allow direct number input for "count", but typically spare covers "all remaining". 
          // If user hits 3 balls out of 4 remaining, they press 3. 
          // If they hit 4 out of 4, they press SPARE.
          // So valid numbers are 0 to remaining-1. 
          // But 0 is MISS. So 1 to remaining-1.
          
          // Let's refine valid check:
          let showBtn = true;
          if (mode === "shot2") {
             // If manual entry, we typically allow 0..remaining-1. 
             // With specialized buttons: 
             // 0 -> MISS btn
             // remaining -> SPARE btn
             // So here we only need 1..remaining-1
             if (num === 0 || num >= remainingBalls) showBtn = false;
          }

          if (!showBtn) {
            return <div key={num} className="opacity-0 pointer-events-none" />;
          }

          return (
            <button
              key={num}
              onClick={() => handlePress(num)}
              disabled={disabled}
              className={`
                ${btnBase} ${btnSurface} text-xl
                ${activeKey === num ? "bg-[var(--game-border)]" : ""}
              `}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
