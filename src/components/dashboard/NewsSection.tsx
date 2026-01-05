"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'update' | 'announcement';
}

const newsItems: NewsItem[] = [
    {
        id: '1',
        date: '2025-12-23',
        title: 'New Game Types Coming Soon',
        description: 'APA 8 Ball, Straight Pool, and Custom Game Types are in development. Stay tuned for updates!',
        type: 'announcement',
    },
    {
        id: '2',
        date: '2025-12-28',
        title: 'APA 9 Ball Game Type Added',
        description: 'APA 9 Ball is now available as a game type. Play APA 9 Ball games and track your stats!',
        type: 'feature',
    }
];

export default function NewsSection() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('news-dismissed');
      setIsDismissed(dismissed === 'true');
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('news-dismissed', 'true');
    }
  };

  if (isDismissed || newsItems.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📢</span>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            What's New
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="space-y-3">
          {newsItems.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold text-blue-900 dark:text-blue-100">{item.title}</span>
                <span className="hidden sm:inline text-blue-600 dark:text-blue-400">•</span>
                <span className="text-blue-800 dark:text-blue-200">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

