"use client";

import { useRef } from "react";
import { useSolanaAnalytics } from "@/hooks/useSolanaAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function SolanaTotalStreams() {
  const { data, isLoading, error } = useSolanaAnalytics();
  const totalStreams = data?.totalStreams || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-20 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading total streams</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
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
          <p className="text-sm font-medium text-text-secondary">
            Total Streams (Solana)
          </p>
          <SourceCodeLink
            fileName="solana-graphql.ts"
            lineNumber={1}
            tooltip="View fetchSolanaTotalStreams source"
          />
        </div>
        <SharePanel
          title="Total Streams (Solana)"
          elementRef={containerRef}
          description="Total vesting streams on the Sablier Solana protocol"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-text-primary">
            {totalStreams !== null ? formatNumber(totalStreams) : "—"}
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
