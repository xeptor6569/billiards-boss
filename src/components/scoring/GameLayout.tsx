"use client";

import { ReactNode } from "react";

interface GameLayoutProps {
    header: ReactNode;
    frameStrip: ReactNode;
    visualizer: ReactNode;
    controls: ReactNode;
}

export default function GameLayout({
    header,
    frameStrip,
    visualizer,
    controls,
}: GameLayoutProps) {
    return (
        <div className="flex flex-col h-full w-full bg-[var(--game-bg)] text-[var(--game-text-primary)] fixed inset-0 overflow-hidden">
            {/* Header (10%) */}
            <div className="h-[10%] min-h-[60px] flex items-center px-4 border-b border-[var(--game-border)] z-20 bg-[var(--game-bg)]">
                {header}
            </div>

            {/* Frame Strip (15%) */}
            <div className="h-[15%] min-h-[70px] bg-[var(--game-bg)] relative z-10 shadow-sm">
                {frameStrip}
            </div>

            {/* Visualizer Stage (30%) - Flexible grow */}
            <div className="flex-1 min-h-[160px] bg-[var(--game-surface)] relative flex flex-col items-center justify-center p-4">
                {visualizer}
            </div>

            {/* Control Pad (45%) - Fixed bottom area */}
            <div className="h-[45%] min-h-[300px] max-h-[500px] bg-[var(--game-bg)] border-t border-[var(--game-border)] pb-safe-area">
                {controls}
            </div>
        </div>
    );
}
