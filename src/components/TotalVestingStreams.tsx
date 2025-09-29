"use client";

import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TotalVestingStreams() {
  const { data, loading, error } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<number | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have totalVestingStreams, fetch directly
  useEffect(() => {
    if (
      !loading &&
      data &&
      !data.totalVestingStreams &&
      fallbackData === null &&
      !fallbackLoading
    ) {
      setFallbackLoading(true);
      fetch("/api/fallback-total-streams")
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setFallbackData(result.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch fallback total vesting streams:", err);
          // In case of error, set a default value to prevent infinite loading
          setFallbackData(0);
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const totalStreams = data?.totalVestingStreams || fallbackData;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading total vesting streams
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (totalStreams === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No total vesting streams data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Vesting Streams
          </p>
          <SourceCodeLink
            fileName="graphql.ts"
            lineNumber={1224}
            tooltip="View fetchTotalVestingStreams source"
          />
        </div>
        <SharePanel
          title="Total Vesting Streams"
          elementRef={containerRef}
          description="Total number of vesting streams ever created on the protocol"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(totalStreams)}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-sablier-100 dark:bg-sablier-900 rounded-lg">
          <svg
            className="w-6 h-6 text-sablier-600 dark:text-sablier-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
