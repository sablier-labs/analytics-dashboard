"use client";

import { useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

// Helper function to format duration in seconds to human-readable format
function formatDuration(seconds: number): { value: string; unit: string } {
  if (seconds === 0) return { value: "0", unit: "seconds" };

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return { value: years.toString(), unit: years === 1 ? "year" : "years" };
    }
    return { value: `${years}.${Math.floor(remainingDays / 36.5)}`, unit: years === 1 ? "year" : "years" };
  }
  
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return { value: months.toString(), unit: months === 1 ? "month" : "months" };
    }
    return { value: `${months}.${Math.floor(remainingDays / 3)}`, unit: months === 1 ? "month" : "months" };
  }

  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return { value: weeks.toString(), unit: weeks === 1 ? "week" : "weeks" };
    }
    return { value: `${weeks}.${Math.floor(remainingDays * 1.4)}`, unit: weeks === 1 ? "week" : "weeks" };
  }

  if (days > 0) {
    return { value: days.toString(), unit: days === 1 ? "day" : "days" };
  }

  if (hours > 0) {
    return { value: hours.toString(), unit: hours === 1 ? "hour" : "hours" };
  }

  if (minutes > 0) {
    return { value: minutes.toString(), unit: minutes === 1 ? "minute" : "minutes" };
  }

  return { value: seconds.toString(), unit: seconds === 1 ? "second" : "seconds" };
}

// Helper function to get short duration format
function getShortDuration(seconds: number): string {
  const { value, unit } = formatDuration(seconds);
  const shortUnit = unit.charAt(0); // y, m, w, d, h, m, s
  return `${value}${shortUnit}`;
}

export function MedianStreamDuration() {
  const { data, loading, error } = useAnalytics();
  const durationStats = data?.streamDurationStats;
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading stream duration data</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!durationStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No stream duration data available</p>
      </div>
    );
  }

  const medianDuration = formatDuration(durationStats.median);
  const averageDuration = formatDuration(durationStats.average);
  const minDuration = formatDuration(durationStats.min);
  const maxDuration = formatDuration(durationStats.max);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Median Stream Duration</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={924} tooltip="View fetchStreamDurationStats source" />
          </div>
          <SharePanel 
            title="Median Stream Duration"
            elementRef={containerRef}
            description="Statistical analysis of vesting stream durations showing median, average, and range"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Duration statistics for all vesting streams
        </p>
      </div>

      {/* Main Median Display */}
      <div className="mb-8 text-center">
        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
          {medianDuration.value}
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-300 capitalize">
          {medianDuration.unit}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Median duration
        </div>
      </div>

      {/* Supporting Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {averageDuration.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 capitalize mb-1">
            {averageDuration.unit}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Average
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {minDuration.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 capitalize mb-1">
            {minDuration.unit}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Minimum
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {maxDuration.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 capitalize mb-1">
            {maxDuration.unit}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Maximum
          </div>
        </div>
      </div>

      {/* Range Summary */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Range: {getShortDuration(durationStats.min)} - {getShortDuration(durationStats.max)}
        </div>
      </div>
    </div>
  );
}