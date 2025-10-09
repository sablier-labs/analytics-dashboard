"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TransactionCounter() {
  const { data, loading, error } = useAnalyticsContext();
  const transactionCount = data?.totalTransactions || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-200 dark:border-red-700 shadow-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading transaction count</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
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
          <p className="text-sm font-semibold text-text-secondary">Total Transactions</p>
          <SourceCodeLink
            fileName="graphql.ts"
            lineNumber={176}
            tooltip="View fetchTotalTransactions source"
          />
        </div>
        <SharePanel
          title="Total Transactions"
          elementRef={containerRef}
          description="Total number of transactions on the Sablier protocol"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-3xl font-bold text-text-primary">
            {transactionCount !== null ? formatNumber(transactionCount) : "—"}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
