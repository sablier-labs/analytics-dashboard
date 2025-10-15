"use client";
import { memo, useMemo } from "react";

import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { getMainnetChainName, isTestnetChain } from "@/lib/constants/chains";
import type { OptimizedStablecoinStream } from "@/lib/services/cache";
import {
  formatDuration,
  getSablierStreamUrl,
  getStreamStatus,
  normalizeAmount,
} from "@/lib/utils/sablier";
import { TokenLogo } from "./TokenLogo";

function formatAmount(amount: string, decimals: string): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholeAmount = BigInt(amount) / divisor;
  return wholeAmount.toLocaleString();
}

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface LargestStablecoinStreamsData {
  largestStablecoinStreams?: OptimizedStablecoinStream[];
}

export const LargestStablecoinStreams = memo(function LargestStablecoinStreams() {
  const { data, loading, error } = useAnalyticsContext() as {
    data: LargestStablecoinStreamsData | null;
    loading: boolean;
    error: string | null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
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
          Error loading stablecoin streams data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Streams are already optimized, filtered, and sorted from Edge Config/cache
  const streams = useMemo(
    () => data?.largestStablecoinStreams || [],
    [data?.largestStablecoinStreams],
  );

  return (
    <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Largest Stablecoin Vesting Streams
      </h2>

      {streams.length === 0 ? (
        <div className="text-center text-text-secondary py-8">
          No stablecoin streams data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-bg-secondary">
                <tr className="border-b border-border-default">
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Rank</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Amount</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Token</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Duration</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Chain</th>
                  <th className="text-left py-3 px-2 font-medium text-text-secondary">Link</th>
                </tr>
              </thead>
              <tbody>
                {streams.map((stream, index) => {
                  const streamUrl = getSablierStreamUrl(
                    stream.chainId,
                    stream.tokenId,
                    stream.contract,
                  );
                  const status = getStreamStatus(stream.endTime);
                  const duration = formatDuration(stream.startTime, stream.endTime);

                  return (
                    <tr
                      key={stream.id}
                      className="border-b border-border-subtle hover:bg-surface-hover transition-colors duration-200"
                    >
                      <td className="py-3 px-2 text-text-primary">#{index + 1}</td>
                      <td className="py-3 px-2 font-medium text-text-primary">
                        {formatAmount(stream.depositAmount, stream.asset.decimals)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <TokenLogo symbol={stream.asset.symbol} size={20} />
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {stream.asset.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {formatDate(stream.startTime)}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">{duration}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            status === "active"
                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : "bg-bg-tertiary dark:bg-surface-raised text-text-primary"
                          }`}
                        >
                          {status === "active" ? "Active" : "Completed"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-bg-tertiary dark:bg-surface-raised text-text-primary rounded">
                          {getMainnetChainName(stream.chainId)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {streamUrl ? (
                          <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                            title="View stream on Sablier"
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
                        ) : (
                          <span className="inline-block w-6 h-6" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});
