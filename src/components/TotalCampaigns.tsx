"use client";

import { useRef } from "react";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function TotalCampaigns() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const totalCampaigns = data?.totalCampaigns || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading total campaigns</p>
        <p className="text-xs text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Campaigns</p>
          <SourceCodeLink
            fileName="airdrops-graphql.ts"
            lineNumber={41}
            tooltip="View fetchTotalCampaigns source"
          />
        </div>
        <SharePanel
          title="Total Campaigns"
          elementRef={containerRef}
          description="Total number of airdrop campaigns (excluding testnets)"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCampaigns !== null ? formatNumber(totalCampaigns) : "—"}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
