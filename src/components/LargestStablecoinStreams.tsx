"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import type { StablecoinStream } from "@/lib/services/graphql";
import { getMainnetChainName, isTestnetChain } from "@/lib/constants/chains";
import { getSablierStreamUrl, formatDuration, getStreamStatus, normalizeAmount } from "@/lib/utils/sablier";
import { TokenLogo } from "./TokenLogo";

function formatAmount(amount: string, decimals: string): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholeAmount = BigInt(amount) / divisor;
  return wholeAmount.toLocaleString();
}

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface LargestStablecoinStreamsData {
  largestStablecoinStreams?: StablecoinStream[];
}

export function LargestStablecoinStreams() {
  const { data, loading } = useAnalytics() as {
    data: LargestStablecoinStreamsData | null;
    loading: boolean;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter out testnets and normalize amounts for proper sorting
  const allStreams = (data?.largestStablecoinStreams || []).filter(stream => !isTestnetChain(stream.chainId));

  // Sort by normalized amounts (not string comparison) and take top 25
  const streams = allStreams
    .map(stream => ({
      ...stream,
      normalizedAmount: normalizeAmount(stream.depositAmount, stream.asset.decimals)
    }))
    .sort((a, b) => {
      // Sort in descending order (largest first)
      if (a.normalizedAmount > b.normalizedAmount) return -1;
      if (a.normalizedAmount < b.normalizedAmount) return 1;
      return 0;
    })
    .slice(0, 25);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Largest Stablecoin Vesting Streams
      </h2>

      {streams.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No stablecoin streams data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Rank
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Token
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Chain
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {streams.map((stream, index) => {
                  const streamUrl = getSablierStreamUrl(stream.chainId, stream.tokenId, stream.contract);
                  const status = getStreamStatus(stream.endTime);
                  const duration = formatDuration(stream.startTime, stream.endTime);

                  return (
                    <tr
                      key={stream.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-2 text-gray-900 dark:text-white">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
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
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {formatDate(stream.startTime)}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {duration}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
}