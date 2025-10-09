"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TotalClaims() {
  const { data, loading, error } = useAnalyticsContext();
  const totalClaims = data?.totalClaims || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-20 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading total claims</p>
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
          <p className="text-sm font-semibold text-text-secondary">Total Claims</p>
          <SourceCodeLink
            fileName="aggregated-graphql.ts"
            lineNumber={548}
            tooltip="View fetchTotalClaims source"
          />
        </div>
        <SharePanel
          title="Total Claims"
          elementRef={containerRef}
          description="Total number of airdrop claims across all Sablier protocols"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-3xl font-bold text-text-primary">
            {totalClaims !== null ? formatNumber(totalClaims) : "—"}
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
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
