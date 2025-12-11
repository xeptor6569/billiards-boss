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
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 fixed inset-0 overflow-hidden">
            {/* Header (10%) */}
            <div className="h-[10%] min-h-[60px] flex items-center px-4 border-b border-slate-200 dark:border-slate-700 z-20 bg-white dark:bg-slate-900">
                {header}
            </div>

            {/* Frame Strip (15%) */}
            <div className="h-[15%] min-h-[70px] bg-white dark:bg-slate-900 relative z-10 shadow-sm">
                {frameStrip}
            </div>

            {/* Visualizer Stage (30%) - Flexible grow */}
            <div className="flex-1 min-h-[160px] bg-slate-50 dark:bg-slate-800 relative flex flex-col items-center justify-center p-4">
                {visualizer}
            </div>

            {/* Control Pad (45%) - Fixed bottom area */}
            <div className="h-[45%] min-h-[300px] max-h-[500px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 pb-safe-area">
                {controls}
            </div>
        </div>
    );
}
