"use client";

import { RefreshCw } from "lucide-react";
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

      if (!response.ok || !result.success) {
        // Extract detailed error message
        let errorMsg = result.message || "Failed to refresh data";
        if (result.results) {
          const errors = [];
          if (result.results.analytics?.error) {
            const err = result.results.analytics.error;
            if (err.includes("403") || err.includes("forbidden")) {
              errors.push("Analytics: Permission denied (check VERCEL_ACCESS_TOKEN)");
            } else {
              errors.push(`Analytics: ${err.substring(0, 100)}`);
            }
          }
          if (result.results.airdrops?.error) {
            const err = result.results.airdrops.error;
            if (err.includes("403") || err.includes("forbidden")) {
              errors.push("Airdrops: Permission denied (check VERCEL_ACCESS_TOKEN)");
            } else {
              errors.push(`Airdrops: ${err.substring(0, 100)}`);
            }
          }
          if (errors.length > 0) errorMsg = errors.join("; ");
        }
        throw new Error(errorMsg);
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
        className="px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
        title="Refresh analytics data"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
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
