"use client";

import { useState } from "react";
import { BUILD_INFO } from "@/lib/build-info";

interface DevDeploymentCardProps {
  userEmail?: string | null;
}

export default function DevDeploymentCard({ userEmail }: DevDeploymentCardProps) {
  const [resetting, setResetting] = useState(false);
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const buildDate = new Date(BUILD_INFO.buildDate).toLocaleString();

  const handleEmail = () => {
    const subject = encodeURIComponent(`Dev Deployment Issue - Build ${BUILD_INFO.display}`);
    const body = encodeURIComponent(
      `Build: ${BUILD_INFO.display}\n` +
      `Commit: ${BUILD_INFO.commitHash}\n` +
      `Date: ${buildDate}\n` +
      `Environment: Development\n\n` +
      `[Describe your issue here]`
    );
    window.location.href = `mailto:billiardsboss.dev@cameronmarotto.com?subject=${subject}&body=${body}`;
  };

  const handleCreateIssue = async () => {
    setCreatingIssue(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/dev/create-github-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Dev Deployment Issue - Build ${BUILD_INFO.display}`,
          body: `**Build Info:**\n- Version: ${BUILD_INFO.display}\n- Commit: ${BUILD_INFO.commitHash}\n- Build Date: ${buildDate}\n- Environment: Development\n\n**Reported by:** ${userEmail || 'Unknown'}\n\n**Description:**\n[Describe your issue here]`,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Issue created! ${data.html_url ? `View it here: ${data.html_url}` : ''}` });
        if (data.html_url) {
          // Open the issue in a new tab
          window.open(data.html_url, '_blank');
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create GitHub issue' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create GitHub issue. Please try again.' });
    } finally {
      setCreatingIssue(false);
    }
  };

  const handleResetHistory = async () => {
    if (!confirm("Are you sure you want to delete ALL your game history? This action cannot be undone.")) {
      return;
    }

    setResetting(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/dev/reset-game-history", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Game history reset successfully!' });
        // Reload page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset game history' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset game history. Please try again.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/10 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Dev Deployment Info
          </h3>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-amber-700 dark:text-amber-300 font-medium">Build:</span>
            <span className="ml-2 text-amber-900 dark:text-amber-100 font-mono">{BUILD_INFO.display}</span>
          </div>
          <div>
            <span className="text-amber-700 dark:text-amber-300 font-medium">Commit:</span>
            <span className="ml-2 text-amber-900 dark:text-amber-100 font-mono">{BUILD_INFO.commitHash}</span>
          </div>
          <div>
            <span className="text-amber-700 dark:text-amber-300 font-medium">Date:</span>
            <span className="ml-2 text-amber-900 dark:text-amber-100">{buildDate}</span>
          </div>
          <div>
            <span className="text-amber-700 dark:text-amber-300 font-medium">Environment:</span>
            <span className="ml-2 text-amber-900 dark:text-amber-100">Development</span>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
          <div className="mb-3">
            <span className="text-amber-700 dark:text-amber-300 font-medium">Contact:</span>
            <div className="mt-1 text-amber-900 dark:text-amber-100">
              <a 
                href="mailto:dev@billiardsboss.com" 
                className="hover:underline"
              >
                dev@billiardsboss.com
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleEmail}
              className="flex-1 px-4 py-2 rounded-md font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white"
            >
              📧 Email
            </button>
            
            <button
              onClick={handleCreateIssue}
              disabled={creatingIssue}
              className="flex-1 px-4 py-2 rounded-md font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingIssue ? "Creating..." : "🐛 Create GitHub Issue"}
            </button>
            
            <button
              onClick={handleResetHistory}
              disabled={resetting}
              className="flex-1 px-4 py-2 rounded-md font-medium transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetting ? "Resetting..." : "🗑️ Reset Game History"}
            </button>
          </div>
          
          {message && (
            <div className={`mt-2 text-sm ${
              message.type === 'success' 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

