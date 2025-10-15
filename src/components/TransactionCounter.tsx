"use client";

import { Activity } from "lucide-react";
import { memo, useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { containerVariants } from "@/lib/variants";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export const TransactionCounter = memo(function TransactionCounter() {
  const { data, loading, error } = useAnalyticsContext();
  const transactionCount = data?.totalTransactions || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className={containerVariants({ elevation: "sm", rounded: "lg", spacing: "default" })}>
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-24 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-28"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading transaction count
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${containerVariants({ elevation: "sm", rounded: "lg", spacing: "default" })} transition-all duration-200 hover:shadow-md`}
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
          <Activity className="w-5 h-5 text-accent-primary" />
        </div>
      </div>
    </div>
  );
});
