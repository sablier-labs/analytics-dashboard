"use client";

import { useRef } from "react";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function MedianClaimWindow() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const medianClaimWindow = data?.medianClaimWindow || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDays = (days: number) => {
    const formattedNumber = formatNumber(days);
    return days === 1 ? `${formattedNumber} day` : `${formattedNumber} days`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading median claim window</p>
        <p className="text-xs text-red-500">{error.message}</p>
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
            Median Claim Window
          </p>
          <SourceCodeLink
            fileName="airdrops-graphql.ts"
            lineNumber={336}
            tooltip="View fetchMedianClaimWindow source"
          />
        </div>
        <SharePanel
          title="Median Claim Window"
          elementRef={containerRef}
          description="Median claim window duration for campaigns with expiration dates"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {medianClaimWindow !== null ? formatDays(medianClaimWindow) : "—"}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg">
          <svg
            className="w-6 h-6 text-amber-600 dark:text-amber-400"
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
        </div>
      </div>
    </div>
  );
}