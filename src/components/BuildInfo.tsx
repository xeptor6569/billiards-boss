'use client';

import { useState, useEffect } from "react";
import { BUILD_INFO } from '@/lib/build-info';

export default function BuildInfo() {
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const buildDate = new Date(BUILD_INFO.buildDate).toLocaleString();

  return (
    <div
      className={`fixed bottom-0 right-0 m-2 z-50 transition-all duration-300 ${
        isMinimized 
          ? 'p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700' 
          : 'p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg'
      }`}
      title={isMinimized ? `Build: ${BUILD_INFO.display}\nClick to expand` : `Version: ${BUILD_INFO.version}\nBuild: ${BUILD_INFO.buildNumber}\nCommit: ${BUILD_INFO.commitHash}\nDate: ${buildDate}\nClick to minimize`}
      onClick={() => setIsMinimized(!isMinimized)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsMinimized(!isMinimized);
        }
      }}
    >
      {isMinimized ? (
        <div className="flex items-center justify-center min-w-[24px] min-h-[24px]">
          <span className="font-semibold text-[10px] leading-none text-green-600 dark:text-green-400">
            {BUILD_INFO.buildNumber}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-900 dark:text-slate-100">
          <span className="text-slate-600 dark:text-slate-400">Build:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{BUILD_INFO.display}</span>
          <span className="text-slate-600 dark:text-slate-400">•</span>
          <span className="text-slate-600 dark:text-slate-400" title={`Commit: ${BUILD_INFO.commitHash}`}>
            {BUILD_INFO.commitHash}
          </span>
        </div>
      )}
    </div>
  );
}

