"use client";

import { useRef } from "react";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { getMainnetChainName } from "@/lib/constants/chains";
import type { AdminStats } from "@/lib/services/airdrops-graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

interface AdminLeaderboardData {
  adminLeaderboard?: AdminStats[];
}

export function AdminLeaderboard() {
  const { data, isLoading, error } = useAirdropsAnalytics() as {
    data: AdminLeaderboardData | null;
    isLoading: boolean;
    error: Error | null;
  };
  const containerRef = useRef<HTMLDivElement>(null);

  const admins = data?.adminLeaderboard || [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`skeleton-admin-${i}`} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading admin leaderboard data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No admin leaderboard data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Leaderboard
            </h2>
            <SourceCodeLink
              fileName="airdrops-graphql.ts"
              lineNumber={677}
              tooltip="View fetchAdminLeaderboard source"
            />
          </div>
          <SharePanel
            title="Admin Leaderboard"
            elementRef={containerRef}
            description="Top 10 campaign creators ranked by number of campaigns"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Top 10 campaign creators ranked by number of campaigns
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Admin
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Campaigns
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Total Claimers
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Avg Claim Rate
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Chains
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr
                  key={admin.admin}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-mono text-xs">
                      {shortenAddress(admin.admin)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(admin.campaignCount)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(admin.totalClaimers)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {admin.averageClaimRate}%
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-gray-600 dark:text-gray-300">
                      {admin.chainIds.length === 1
                        ? getMainnetChainName(admin.chainIds[0]) || admin.chainIds[0]
                        : `${admin.chainIds.length} chains`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}