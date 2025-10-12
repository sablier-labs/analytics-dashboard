"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { TimeBasedUserCounts } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TimeBasedUserCounters() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const userCounts = data?.timeBasedUsers || null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const timeRanges = [
    {
      color: "bg-sablier-100 text-sablier-600 dark:bg-sablier-900 dark:text-sablier-400",
      key: "past30Days" as keyof TimeBasedUserCounts,
      label: "Past 30 Days",
    },
    {
      color: "bg-sablier-200 text-sablier-700 dark:bg-sablier-800 dark:text-sablier-300",
      key: "past90Days" as keyof TimeBasedUserCounts,
      label: "Past 90 Days",
    },
    {
      color: "bg-sablier-300 text-sablier-800 dark:bg-sablier-700 dark:text-sablier-200",
      key: "past180Days" as keyof TimeBasedUserCounts,
      label: "Past 180 Days",
    },
    {
      color: "bg-sablier-400 text-sablier-900 dark:bg-sablier-600 dark:text-sablier-100",
      key: "pastYear" as keyof TimeBasedUserCounts,
      label: "Past Year",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div
            key={range.key}
            className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
          >
            <div className="animate-pulse">
              <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-24 mb-2"></div>
              <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading time-based user counts
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Active Users by Time Period</h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={213}
              tooltip="View fetchTimeBasedUserCounts source"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <SharePanel
              title="Active Users by Time Period"
              elementRef={containerRef}
              description="Users who have made transactions within each time range"
            />
          </div>
        </div>
        <p className="text-text-secondary">
          Users who have made transactions within each time range
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div
            key={range.key}
            className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">{range.label}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {userCounts ? formatNumber(userCounts[range.key]) : "—"}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 ${range.color} rounded-lg`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {userCounts && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center text-xs text-text-tertiary">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Active users
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
