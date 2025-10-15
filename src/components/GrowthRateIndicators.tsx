"use client";

import { memo, useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { GrowthRateMetrics } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export const GrowthRateIndicators = memo(function GrowthRateIndicators() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const growthMetrics = data?.growthRateMetrics || null;

  const formatPercentage = (value: number | null) => {
    if (value === null) return "N/A";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number | null) => {
    if (value === null) return "text-text-secondary";
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-text-secondary";
  };

  const getGrowthIcon = (value: number | null) => {
    if (value === null) return null;
    if (value > 0) {
      return (
        <svg
          className="w-4 h-4 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      );
    }
    if (value < 0) {
      return (
        <svg
          className="w-4 h-4 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 13l-5 5m0 0l-5-5m5 5V6"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 text-text-secondary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-20"></div>
                <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading growth metrics</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!growthMetrics) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No growth metrics available</p>
      </div>
    );
  }

  const metrics = [
    {
      description: "Month-over-month",
      hasSourceLink: true,
      label: "User Growth",
      value: growthMetrics.userGrowthRate,
    },
    {
      description: "Month-over-month",
      hasSourceLink: false,
      label: "Transaction Growth",
      value: growthMetrics.transactionGrowthRate,
    },
    {
      description: "Month-over-month",
      hasSourceLink: false,
      label: "Avg Tx/User Growth",
      value: growthMetrics.averageTransactionGrowthRate,
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Growth Rate Indicators</h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={768}
              tooltip="View fetchGrowthRateMetrics source"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <SharePanel
              title="Growth Rate Indicators"
              elementRef={containerRef}
              description="Month-over-month growth metrics for users, transactions, and average activity"
            />
          </div>
        </div>
        <p className="text-text-secondary">Month-over-month growth metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
                  {metric.hasSourceLink && (
                    <SourceCodeLink
                      fileName="graphql.ts"
                      lineNumber={768}
                      tooltip="View growth metrics source"
                    />
                  )}
                </div>
                <p className={`text-2xl font-bold ${getGrowthColor(metric.value)}`}>
                  {formatPercentage(metric.value)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">{metric.description}</p>
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  metric.value === null
                    ? "bg-bg-tertiary dark:bg-surface-raised"
                    : metric.value > 0
                      ? "bg-green-100 dark:bg-green-900/20"
                      : metric.value < 0
                        ? "bg-red-100 dark:bg-red-900/20"
                        : "bg-bg-tertiary dark:bg-surface-raised"
                }`}
              >
                {getGrowthIcon(metric.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
