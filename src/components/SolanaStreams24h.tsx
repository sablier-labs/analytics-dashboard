"use client";

import { memo, useRef } from "react";
import { useSolanaAnalytics } from "@/hooks/useSolanaAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export const SolanaStreams24h = memo(function SolanaStreams24h() {
  const { data, isLoading, error } = useSolanaAnalytics();
  const streams24h = data?.streams24h || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-20 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading streams (24h)</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-secondary">Streams (24h) - Solana</p>
          <SourceCodeLink
            fileName="solana-graphql.ts"
            lineNumber={1}
            tooltip="View fetchSolanaStreams24h source"
          />
        </div>
        <SharePanel
          title="Streams (24h) - Solana"
          elementRef={containerRef}
          description="Streams created in the last 24 hours on Solana"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-text-primary">{formatNumber(streams24h ?? 0)}</p>
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});
