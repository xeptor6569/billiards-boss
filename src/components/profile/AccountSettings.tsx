"use client";

import { useState } from "react";

export default function AccountSettings() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    setExportError("");
    setExporting(true);

    try {
      const response = await fetch("/api/user/export");

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billiards-boss-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setExportError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Data Export
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Download all your account data, including games, statistics, and
          profile information, in JSON format.
        </p>
        {exportError && (
          <div className="mb-4 rounded-md p-3 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              {exportError}
            </p>
          </div>
        )}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-md font-medium text-white bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
        >
          {exporting ? "Exporting..." : "Export My Data"}
        </button>
      </div>

      <div className="rounded-lg border border-red-200 dark:border-red-900/50 p-6 bg-red-50 dark:bg-red-900/10">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          disabled
          className="px-4 py-2 rounded-md font-medium text-white bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
        >
          Delete Account (Coming Soon)
        </button>
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Account deletion will be available in a future update.
        </p>
      </div>
    </div>
  );
}
