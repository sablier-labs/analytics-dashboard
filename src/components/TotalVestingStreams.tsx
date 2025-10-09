"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TotalVestingStreams() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);
    
    // Use cached data if available, otherwise use fallback data
  const totalStreams = data?.totalVestingStreams || null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-32 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-36"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading total vesting streams
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (totalStreams === null) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6">
        <p className="text-text-secondary">No total vesting streams data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-secondary">
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
          <p className="text-3xl font-bold text-text-primary">
            {formatNumber(totalStreams)}
          </p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-primary/10 to-accent-primary/20 dark:from-accent-primary/20 dark:to-accent-primary/30 rounded-xl">
          <svg
            className="w-7 h-7 text-accent-primary"
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
