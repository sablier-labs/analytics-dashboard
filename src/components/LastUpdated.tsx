"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";

export function LastUpdated() {
  const { data, loading, refetch } = useAnalyticsContext();
  const [relativeTime, setRelativeTime] = useState<string>("");
  const lastRefetchAttempt = useRef<number>(0);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      month: "long",
      timeZoneName: "short",
      year: "numeric",
    });
  };

  const getRelativeTime = useCallback((timestamp: string) => {
    const now = Date.now();
    const updatedTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - updatedTime) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }, []);

  const getFreshnessColor = (timestamp: string) => {
    const now = Date.now();
    const updatedTime = new Date(timestamp).getTime();
    const diffInHours = (now - updatedTime) / (1000 * 60 * 60);

    if (diffInHours < 1) return "text-green-600 dark:text-green-400";
    if (diffInHours < 2) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  useEffect(() => {
    if (!data?.lastUpdated) return;

    // Update relative time immediately
    setRelativeTime(getRelativeTime(data.lastUpdated));

    // Update relative time every minute
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(data.lastUpdated));
    }, 60000);

    return () => clearInterval(interval);
  }, [data?.lastUpdated, getRelativeTime]);

  // Auto-refresh stale data
  useEffect(() => {
    if (!data?.lastUpdated || loading) return;

    const checkDataFreshness = () => {
      const now = Date.now();
      const updatedTime = new Date(data.lastUpdated).getTime();
      const diffInHours = (now - updatedTime) / (1000 * 60 * 60);

      // Only refetch if data is >1h old AND we haven't tried in the last 5 minutes
      const timeSinceLastAttempt = (now - lastRefetchAttempt.current) / (1000 * 60);

      if (diffInHours >= 1 && timeSinceLastAttempt >= 5) {
        console.log("Data is stale (>1h old), auto-refreshing...");
        lastRefetchAttempt.current = now;
        void refetch();
      }
    };

    // Check every 5 minutes (not immediately to avoid loop on mount)
    const freshnessInterval = setInterval(checkDataFreshness, 5 * 60 * 1000);

    return () => clearInterval(freshnessInterval);
  }, [data?.lastUpdated, loading, refetch]);

  if (loading || !data?.lastUpdated) {
    return (
      <div className="flex items-center justify-center text-sm text-text-tertiary">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse"></div>
          <span>Loading data status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex items-center justify-center text-sm text-text-secondary">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-text-tertiary" />
          <span>Data last updated:</span>
          <span
            className={getFreshnessColor(data.lastUpdated)}
            title={formatTimestamp(data.lastUpdated)}
          >
            {relativeTime}
          </span>
          <span className="text-text-muted">•</span>
          <span className="text-xs text-text-tertiary">
            {formatTimestamp(data.lastUpdated)}
          </span>
        </div>
      </div>
      <RefreshButton onRefresh={refetch} />
    </div>
  );
}
