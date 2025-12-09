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
          ? 'p-1.5 rounded-full border' 
          : 'p-2 rounded border shadow-lg'
      }`}
      style={{
        backgroundColor: isMinimized 
          ? 'var(--color-surface)' 
          : 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
      }}
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
          <span className="font-semibold text-[10px] leading-none" style={{ color: 'var(--color-success)' }}>
            {BUILD_INFO.buildNumber}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-textPrimary)' }}>
          <span style={{ color: 'var(--color-textSecondary)' }}>Build:</span>
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{BUILD_INFO.display}</span>
          <span style={{ color: 'var(--color-textSecondary)' }}>•</span>
          <span style={{ color: 'var(--color-textSecondary)' }} title={`Commit: ${BUILD_INFO.commitHash}`}>
            {BUILD_INFO.commitHash}
          </span>
        </div>
      )}
    </div>
  );
}

