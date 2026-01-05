"use client";

import { useState, useEffect, useRef } from "react";

interface TimeoutTimerProps {
  isActive: boolean;
  onComplete: () => void;
  onEndEarly?: () => void;
  duration: number; // in seconds (default 120 for 2 minutes)
}

export default function TimeoutTimer({
  isActive,
  onComplete,
  onEndEarly,
  duration = 120,
}: TimeoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time expired
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, onComplete]);
  
  // Reset timer when it becomes active
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(duration);
    }
  }, [isActive, duration]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = (timeRemaining / duration) * 100;
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-amber-500 text-white px-6 py-4 rounded-lg shadow-lg border-2 border-amber-600">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl font-bold">
          {formatTime(timeRemaining)}
        </div>
        <div className="w-32 h-2 bg-amber-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="text-xs text-center mb-2 font-semibold">
        Time-out in progress
      </div>
      {onEndEarly && (
        <button
          onClick={onEndEarly}
          className="w-full px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors text-sm"
        >
          End Time-out
        </button>
      )}
    </div>
  );
}

