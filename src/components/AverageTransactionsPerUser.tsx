"use client";

import { useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function AverageTransactionsPerUser() {
  const { data, loading, error } = useAnalytics();
  const averageTransactions = data?.averageTransactionsPerUser || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading average transactions</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 relative"
    >
      <div className="absolute top-3 right-3">
        <SharePanel 
          title="Average Transactions Per User"
          elementRef={containerRef}
          description="Average number of transactions per user on the Sablier protocol"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Transactions Per User</p>
            <SourceCodeLink fileName="graphql.ts" lineNumber={642} tooltip="View fetchAverageTransactionsPerUser source" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {averageTransactions !== null ? formatNumber(averageTransactions) : "—"}
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
