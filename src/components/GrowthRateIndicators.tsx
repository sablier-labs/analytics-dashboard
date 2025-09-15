"use client";

import { useRef, useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { GrowthRateMetrics } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function GrowthRateIndicators() {
  const { data, loading, error } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<GrowthRateMetrics | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have growthRateMetrics, fetch directly
  useEffect(() => {
    if (!loading && data && (!data.growthRateMetrics || Object.values(data.growthRateMetrics).every(v => v === 0)) && !fallbackData && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/fallback-growth-metrics')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log('Growth rate metrics loaded via fallback');
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback growth metrics:', err);
          // In case of error, set a default object to prevent infinite loading
          setFallbackData({ averageTransactionGrowthRate: 0, transactionGrowthRate: 0, userGrowthRate: 0 });
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use fallback data if available, otherwise use cached data (prefer real data over zeros)
  const hasValidCachedData = data?.growthRateMetrics && !Object.values(data.growthRateMetrics).every(v => v === 0);
  const growthMetrics = fallbackData || (hasValidCachedData ? data.growthRateMetrics : null);

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-300";
  };

  const getGrowthIcon = (value: number) => {
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
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading growth metrics</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!growthMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No growth metrics available</p>
      </div>
    );
  }

  const metrics = [
    {
      description: "Month-over-month",
      label: "User Growth",
      value: growthMetrics.userGrowthRate,
      hasSourceLink: true,
    },
    {
      description: "Month-over-month",
      label: "Transaction Growth",
      value: growthMetrics.transactionGrowthRate,
      hasSourceLink: false,
    },
    {
      description: "Month-over-month",
      label: "Avg Tx/User Growth",
      value: growthMetrics.averageTransactionGrowthRate,
      hasSourceLink: false,
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Growth Rate Indicators</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={768} tooltip="View fetchGrowthRateMetrics source" />
          </div>
          <div className="flex-1 flex justify-end">
            <SharePanel 
              title="Growth Rate Indicators"
              elementRef={containerRef}
              description="Month-over-month growth metrics for users, transactions, and average activity"
            />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Month-over-month growth metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.label}</p>
                  {metric.hasSourceLink && (
                    <SourceCodeLink fileName="graphql.ts" lineNumber={768} tooltip="View growth metrics source" />
                  )}
                </div>
                <p className={`text-2xl font-bold ${getGrowthColor(metric.value)}`}>
                  {formatPercentage(metric.value)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.description}</p>
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  metric.value > 0 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : metric.value < 0 
                    ? "bg-red-100 dark:bg-red-900/20" 
                    : "bg-gray-100 dark:bg-gray-700"
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
}
