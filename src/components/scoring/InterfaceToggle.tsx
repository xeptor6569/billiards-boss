"use client";

import { useScoringInterface, ScoringInterface } from "@/hooks/useScoringInterface";

interface InterfaceToggleProps {
  className?: string;
  variant?: "light" | "dark";
}

export default function InterfaceToggle({ className = "", variant = "light" }: InterfaceToggleProps) {
  const { interfaceType, setInterface } = useScoringInterface();

  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isDark && <span className="text-sm text-gray-600 dark:text-gray-400">Interface:</span>}
      <div 
        className={`flex rounded-lg p-1 ${!isDark ? "bg-gray-200 dark:bg-gray-700" : ""}`}
        style={isDark ? { backgroundColor: "#18181b", border: "1px solid #27272a" } : {}}
      >
        <button
          type="button"
          onClick={() => setInterface("immersive")}
          className="px-3 py-1 rounded-md text-sm font-medium transition-all touch-manipulation"
          style={
            interfaceType === "immersive"
              ? {
                  backgroundColor: isDark ? "#22c55e" : "#22c55e",
                  color: "#f4f4f5",
                }
              : isDark
              ? {
                  color: "#f4f4f5",
                  opacity: 0.6,
                }
              : {
                  color: "#374151",
                }
          }
          onMouseEnter={(e) => {
            if (interfaceType !== "immersive") {
              e.currentTarget.style.opacity = isDark ? "0.8" : "1";
            }
          }}
          onMouseLeave={(e) => {
            if (interfaceType !== "immersive") {
              e.currentTarget.style.opacity = isDark ? "0.6" : "1";
            }
          }}
        >
          Immersive
        </button>
        <button
          type="button"
          onClick={() => setInterface("simple")}
          className="px-3 py-1 rounded-md text-sm font-medium transition-all touch-manipulation"
          style={
            interfaceType === "simple"
              ? {
                  backgroundColor: isDark ? "#06b6d4" : "#4f46e5",
                  color: "#f4f4f5",
                }
              : isDark
              ? {
                  color: "#f4f4f5",
                  opacity: 0.6,
                }
              : {
                  color: "#374151",
                }
          }
          onMouseEnter={(e) => {
            if (interfaceType !== "simple") {
              e.currentTarget.style.opacity = isDark ? "0.8" : "1";
            }
          }}
          onMouseLeave={(e) => {
            if (interfaceType !== "simple") {
              e.currentTarget.style.opacity = isDark ? "0.6" : "1";
            }
          }}
        >
          Simple
        </button>
      </div>
    </div>
  );
}

