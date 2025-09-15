"use client";

import { useRef, useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function TotalVestingStreams() {
  const { data, loading, error } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<number | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have totalVestingStreams, fetch directly
  useEffect(() => {
    if (!loading && data && !data.totalVestingStreams && fallbackData === null && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/test-total-streams')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log(`Total vesting streams loaded via fallback: ${result.data.toLocaleString()}`);
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback total vesting streams:', err);
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
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading total vesting streams</p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Vesting Streams</p>
          <SourceCodeLink fileName="graphql.ts" lineNumber={1224} tooltip="View fetchTotalVestingStreams source" />
        </div>
        <SharePanel 
          title="Total Vesting Streams"
          elementRef={containerRef}
          description="Total number of vesting streams ever created on the protocol"
        />
      </div>
      
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(totalStreams)}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Streams created since protocol launch
      </p>
    </div>
  );
}