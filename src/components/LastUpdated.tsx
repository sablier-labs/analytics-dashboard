"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useState } from "react";

export function LastUpdated() {
  const { data, loading } = useAnalytics();
  const [relativeTime, setRelativeTime] = useState<string>("");

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date().getTime();
    const updatedTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - updatedTime) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  };

  const getFreshnessColor = (timestamp: string) => {
    const now = new Date().getTime();
    const updatedTime = new Date(timestamp).getTime();
    const diffInHours = (now - updatedTime) / (1000 * 60 * 60);

    if (diffInHours < 1) return "text-green-600 dark:text-green-400";
    if (diffInHours < 24) return "text-yellow-600 dark:text-yellow-400";
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
  }, [data?.lastUpdated]);

  if (loading || !data?.lastUpdated) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span>Loading data status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
      <div className="flex items-center space-x-2">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Data last updated:</span>
        <span className={getFreshnessColor(data.lastUpdated)} title={formatTimestamp(data.lastUpdated)}>
          {relativeTime}
        </span>
        <span className="text-gray-400 dark:text-gray-500">•</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(data.lastUpdated)}
        </span>
      </div>
    </div>
  );
}