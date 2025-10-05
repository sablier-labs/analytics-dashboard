"use client";

import { useState } from "react";

interface RefreshButtonProps {
  onRefresh?: () => Promise<void> | void;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      setMessage(null);

      console.log("🔄 Triggering manual refresh...");

      const response = await fetch("/api/manual-trigger", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();
      console.log("Manual trigger response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to refresh data");
      }

      // Trigger analytics refetch if callback provided and wait for it
      if (onRefresh) {
        console.log("🔄 Refetching analytics data...");
        await onRefresh();
        console.log("✅ Analytics data refetched");
      }

      setMessage({ text: "Data refreshed successfully!", type: "success" });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("❌ Refresh failed:", error);
      setMessage({
        text: error instanceof Error ? error.message : "Failed to refresh data",
        type: "error",
      });

      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Refresh all analytics data"
      >
        <svg
          className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
      </button>

      {message && (
        <div
          className={`text-xs px-2 py-1 rounded ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
