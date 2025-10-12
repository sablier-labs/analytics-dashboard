"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { StreamDurationStats } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

// Helper function to format duration in seconds to human-readable format
function formatDuration(seconds: number): { value: string; unit: string } {
  if (seconds === 0) return { unit: "seconds", value: "0" };

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return { unit: years === 1 ? "year" : "years", value: years.toString() };
    }
    return {
      unit: years === 1 ? "year" : "years",
      value: `${years}.${Math.floor(remainingDays / 36.5)}`,
    };
  }

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return { unit: months === 1 ? "month" : "months", value: months.toString() };
    }
    return {
      unit: months === 1 ? "month" : "months",
      value: `${months}.${Math.floor(remainingDays / 3)}`,
    };
  }

  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return { unit: weeks === 1 ? "week" : "weeks", value: weeks.toString() };
    }
    return {
      unit: weeks === 1 ? "week" : "weeks",
      value: `${weeks}.${Math.floor(remainingDays * 1.4)}`,
    };
  }

  if (days > 0) {
    return { unit: days === 1 ? "day" : "days", value: days.toString() };
  }

  if (hours > 0) {
    return { unit: hours === 1 ? "hour" : "hours", value: hours.toString() };
  }

  if (minutes > 0) {
    return { unit: minutes === 1 ? "minute" : "minutes", value: minutes.toString() };
  }

  return { unit: seconds === 1 ? "second" : "seconds", value: seconds.toString() };
}

export function MedianStreamDuration() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use cached data if available, otherwise use fallback data
  const durationStats = data?.streamDurationStats || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-16 bg-bg-tertiary dark:bg-surface-hover rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            <div className="h-12 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            <div className="h-12 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading stream duration data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!durationStats) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No stream duration data available</p>
      </div>
    );
  }

  const medianDuration = formatDuration(durationStats.median);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Median Vesting Stream Duration</h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={924}
              tooltip="View fetchStreamDurationStats source"
            />
          </div>
          <SharePanel
            title="Median Vesting Stream Duration"
            elementRef={containerRef}
            description="Median duration of vesting streams longer than 24 hours"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Median duration for vesting streams longer than 24 hours
        </p>
      </div>

      {/* Simple Median Display */}
      <div className="text-center">
        <div className="text-5xl font-bold text-text-primary mb-2">{medianDuration.value}</div>
        <div className="text-lg text-text-secondary capitalize">{medianDuration.unit}</div>
      </div>
    </div>
  );
}
