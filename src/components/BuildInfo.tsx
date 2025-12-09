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
          ? 'bg-gray-900/30 hover:bg-gray-900/50 p-1.5 rounded-full border border-gray-700/50' 
          : 'bg-gray-900/90 hover:bg-gray-800/95 p-2 rounded border border-gray-700 shadow-lg'
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
          <span className="text-green-400 font-semibold text-[10px] leading-none">
            {BUILD_INFO.buildNumber}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-white text-xs font-mono">
          <span className="text-gray-400">Build:</span>
          <span className="text-green-400 font-semibold">{BUILD_INFO.display}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400" title={`Commit: ${BUILD_INFO.commitHash}`}>
            {BUILD_INFO.commitHash}
          </span>
        </div>
      )}
    </div>
  );
}

