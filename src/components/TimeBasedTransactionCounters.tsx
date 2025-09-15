"use client";

import { useRef, useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { TimeBasedTransactionCounts } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function TimeBasedTransactionCounters() {
  const { data, loading, error } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<TimeBasedTransactionCounts | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have timeBasedTransactions, fetch directly
  useEffect(() => {
    if (!loading && data && (!data.timeBasedTransactions || Object.values(data.timeBasedTransactions).every(v => v === 0)) && !fallbackData && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/fallback-time-transactions')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log('Time-based transactions loaded via fallback');
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback time-based transactions:', err);
          setFallbackData({ past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 });
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const transactionCounts = data?.timeBasedTransactions || fallbackData;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const timeRanges = [
    {
      color: "bg-sablier-100 text-sablier-600 dark:bg-sablier-900 dark:text-sablier-400",
      key: "past30Days" as keyof TimeBasedTransactionCounts,
      label: "Past 30 Days",
    },
    {
      color: "bg-sablier-200 text-sablier-700 dark:bg-sablier-800 dark:text-sablier-300",
      key: "past90Days" as keyof TimeBasedTransactionCounts,
      label: "Past 90 Days",
    },
    {
      color: "bg-sablier-300 text-sablier-800 dark:bg-sablier-700 dark:text-sablier-200",
      key: "past180Days" as keyof TimeBasedTransactionCounts,
      label: "Past 180 Days",
    },
    {
      color: "bg-sablier-400 text-sablier-900 dark:bg-sablier-600 dark:text-sablier-100",
      key: "pastYear" as keyof TimeBasedTransactionCounts,
      label: "Past Year",
    },
  ];

  if (loading || fallbackLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div key={range.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading time-based transaction counts</p>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction Activity by Time Period
            </h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={301} tooltip="View fetchTimeBasedTransactionCounts source" />
          </div>
          <div className="flex-1 flex justify-end">
            <SharePanel 
              title="Transaction Activity by Time Period"
              elementRef={containerRef}
              description="Number of transactions processed within each time range"
            />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Number of transactions processed within each time range</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div key={range.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{range.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactionCounts ? formatNumber(transactionCounts[range.key]) : "—"}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>

            {transactionCounts && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Total transactions
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
