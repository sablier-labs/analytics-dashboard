"use client";

import { useRef } from "react";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import type { CampaignCompletionRate } from "@/lib/services/airdrops-graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

interface CampaignCompletionRateData {
  campaignCompletionRate?: CampaignCompletionRate;
}

export function CampaignCompletionRate() {
  const { data, isLoading, error } = useAirdropsAnalytics() as {
    data: CampaignCompletionRateData | null;
    isLoading: boolean;
    error: Error | null;
  };
  const containerRef = useRef<HTMLDivElement>(null);

  const completionData = data?.campaignCompletionRate;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading completion rate data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!completionData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No completion rate data available</p>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Completion Rate
          </h3>
          <SourceCodeLink
            fileName="airdrops-graphql.ts"
            lineNumber={588}
            tooltip="View fetchCampaignCompletionRate source"
          />
        </div>
        <SharePanel
          title="Campaign Completion Rate"
          elementRef={containerRef}
          description="Percentage of campaigns where all tokens were claimed"
        />
      </div>

      <div className="space-y-3">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {completionData.completionRate}%
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          {completionData.completedCampaigns.toLocaleString()} of{" "}
          {completionData.totalCampaigns.toLocaleString()} campaigns
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Campaigns where all recipients claimed their tokens
        </div>
      </div>
    </div>
  );
}