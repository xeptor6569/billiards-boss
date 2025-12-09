'use client';

import { useState, useEffect } from "react";
import { BUILD_INFO } from '@/lib/build-info';

export default function BuildInfo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const buildDate = new Date(BUILD_INFO.buildDate).toLocaleString();

  return (
    <div
      className="fixed bottom-0 right-0 m-2 p-2 bg-gray-900/90 text-white text-xs font-mono rounded border border-gray-700 z-50 shadow-lg hover:bg-gray-800/95 transition-colors"
      title={`Version: ${BUILD_INFO.version}\nBuild: ${BUILD_INFO.buildNumber}\nCommit: ${BUILD_INFO.commitHash}\nDate: ${buildDate}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Build:</span>
        <span className="text-green-400 font-semibold">{BUILD_INFO.display}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400" title={`Commit: ${BUILD_INFO.commitHash}`}>
          {BUILD_INFO.commitHash}
        </span>
      </div>
    </div>
  );
}

