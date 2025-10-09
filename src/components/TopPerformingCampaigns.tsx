"use client";

import { useRef } from "react";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { getMainnetChainName } from "@/lib/constants/chains";
import type { TopPerformingCampaign } from "@/lib/services/airdrops-graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string): string {
  const num = parseInt(amount, 10);
  return num.toLocaleString();
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenCampaignId(id: string): string {
  const parts = id.split("-");
  const address = parts[0];
  const chain = parts[1];
  return `${address.slice(0, 8)}...${address.slice(-4)}-${chain}`;
}


interface TopPerformingCampaignsData {
  topPerformingCampaigns?: TopPerformingCampaign[];
}

export function TopPerformingCampaigns() {
  const { data, isLoading, error } = useAirdropsAnalytics() as {
    data: TopPerformingCampaignsData | null;
    isLoading: boolean;
    error: Error | null;
  };
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`skeleton-row-${i}`} className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading top performing campaigns data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  const campaigns = data?.topPerformingCampaigns || [];

  if (campaigns.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No top performing campaigns data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Top Performing Campaigns
            </h2>
            <SourceCodeLink
              fileName="airdrops-graphql.ts"
              lineNumber={569}
              tooltip="View fetchTopPerformingCampaigns source"
            />
          </div>
          <SharePanel
            title="Top Performing Campaigns"
            elementRef={containerRef}
            description="Top 10 airdrop campaigns ranked by number of claimers"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Top 10 airdrop campaigns ranked by number of claimers
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-bg-secondary">
              <tr className="border-b border-border-default">
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Rank
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Campaign
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Claimers
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Claim Rate
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Chain
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Start Date
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Admin
                </th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => {
                const campaignUrl = `https://app.sablier.com/airdrops/campaign/${campaign.id}/`;

                return (
                  <tr
                    key={campaign.id}
                    className="border-b border-border-default hover:bg-surface-hover dark:hover:bg-surface-hover"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-mono text-xs">
                        {shortenCampaignId(campaign.id)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold">
                        {formatAmount(campaign.claimedCount)} / {formatAmount(campaign.totalRecipients)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-text-primary">
                        {campaign.claimRate}%
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-text-secondary">
                        {campaign.chainName}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-text-secondary">
                        {formatDate(campaign.timestamp)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-mono text-xs text-text-secondary">
                        {shortenAddress(campaign.admin)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <a
                        href={campaignUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}