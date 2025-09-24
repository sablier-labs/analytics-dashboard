"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import type { StablecoinStream } from "@/lib/services/graphql";
import { getMainnetChainName, isTestnetChain } from "@/lib/constants/chains";

function formatAmount(amount: string, decimals: string): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholeAmount = BigInt(amount) / divisor;
  return wholeAmount.toLocaleString();
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const streams = (data?.largestStablecoinStreams || []).filter(stream => !isTestnetChain(stream.chainId));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Largest Stablecoin Streams
      </h2>

      {streams.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No stablecoin streams data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
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
                  Sender
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Recipient
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Chain
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {streams.map((stream, index) => (
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
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {stream.asset.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {formatAddress(stream.sender)}
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {formatAddress(stream.recipient)}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {getMainnetChainName(stream.chainId)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                    {formatDate(stream.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}