import { isTestnetChain } from "@/lib/constants/chains";
import {
  fetchAggregated24HourMetrics,
  fetchAggregatedMonthlyTransactionGrowth,
  fetchAggregatedMonthlyUserGrowth,
  fetchAggregatedTimeBasedTransactionCounts,
  fetchAggregatedTimeBasedUserCounts,
  fetchAggregatedTotalTransactions,
  fetchAggregatedTotalUsers,
} from "@/lib/services/aggregated-graphql";
import type { StablecoinStream } from "@/lib/services/graphql";
import {
  fetchActiveVsCompletedStreams,
  fetchChainDistribution,
  fetchGrowthRateMetrics,
  fetchLargestStablecoinStreams,
  fetchMonthlyStreamCreation,
  fetchStreamCategoryDistribution,
  fetchStreamDurationStats,
  fetchStreamProperties,
  fetchTopAssetsByStreamCount,
  fetchTotalVestingStreams,
} from "@/lib/services/graphql";
import { normalizeAmount } from "@/lib/utils/sablier";
import {
  CACHE_LIMITS,
  createCacheSummary,
  optimizeAnalyticsCache,
  validateCacheSize,
} from "./cache-optimization";

// Optimized stream interface for Edge Config (only essential fields)
interface OptimizedStablecoinStream {
  id: string;
  tokenId: string;
  depositAmount: string;
  chainId: string;
  contract: string;
  startTime: string;
  endTime: string;
  asset: {
    symbol: string;
    decimals: string;
  };
}

function optimizeStablecoinStreams(streams: StablecoinStream[]): OptimizedStablecoinStream[] {
  // Filter out testnets and normalize amounts for proper sorting
  const validStreams = streams.filter((stream) => !isTestnetChain(stream.chainId));

  // Sort by normalized amounts and take only top limit (reduced from 25 to 20)
  const sortedStreams = validStreams
    .map((stream) => ({
      ...stream,
      normalizedAmount: normalizeAmount(stream.depositAmount, stream.asset.decimals),
    }))
    .sort((a, b) => {
      // Sort in descending order (largest first)
      if (a.normalizedAmount > b.normalizedAmount) return -1;
      if (a.normalizedAmount < b.normalizedAmount) return 1;
      return 0;
    })
    .slice(0, CACHE_LIMITS.TOP_STABLECOIN_STREAMS) // Use optimized limit
    .map((stream) => ({
      asset: {
        decimals: stream.asset.decimals,
        symbol: stream.asset.symbol,
      },
      chainId: stream.chainId,
      contract: stream.contract,
      depositAmount: stream.depositAmount,
      // Optimize timestamps - remove unnecessary precision for older streams
      endTime: stream.endTime.split("T")[0] + "T23:59:59Z",
      id: stream.id,
      startTime: stream.startTime.split("T")[0] + "T00:00:00Z",
      tokenId: stream.tokenId,
    }));

  return sortedStreams;
}

export async function updateAnalyticsCache() {
  console.log("🚀 Starting optimized cache update...");

  // Fetch all analytics data in parallel, preserving existing data on failure
  const [
    totalUsers,
    totalTransactions,
    timeBasedUsers,
    timeBasedTransactions,
    monthlyUserGrowth,
    chainDistribution,
    monthlyTransactionGrowth,
    topAssets,
    growthRateMetrics,
    monthlyStreamCreation,
    streamDurationStats,
    streamProperties,
    streamCategoryDistribution,
    totalVestingStreams,
    activeVsCompletedStreams,
    largestStablecoinStreams,
    activity24Hours,
  ] = await Promise.all([
    fetchAggregatedTotalUsers().catch((err) => {
      console.error("Error fetching aggregated total users:", err);
      return 0;
    }),
    fetchAggregatedTotalTransactions().catch((err) => {
      console.error("Error fetching aggregated total transactions:", err);
      return 0;
    }),
    fetchAggregatedTimeBasedUserCounts().catch((err) => {
      console.error("Error fetching aggregated time-based users:", err);
      return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
    }),
    fetchAggregatedTimeBasedTransactionCounts().catch((err) => {
      console.error("Error fetching aggregated time-based transactions:", err);
      return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
    }),
    fetchAggregatedMonthlyUserGrowth().catch((err) => {
      console.error("Error fetching aggregated monthly user growth:", err);
      return [];
    }),
    fetchChainDistribution().catch((err) => {
      console.error("Error fetching chain distribution:", err);
      return [];
    }),
    fetchAggregatedMonthlyTransactionGrowth().catch((err) => {
      console.error("Error fetching aggregated monthly transaction growth:", err);
      return [];
    }),
    fetchTopAssetsByStreamCount().catch((err) => {
      console.error("Error fetching top assets:", err);
      return [];
    }),
    fetchGrowthRateMetrics().catch((err) => {
      console.error("Error fetching growth rate metrics:", err);
      return { averageTransactionGrowthRate: 0, transactionGrowthRate: 0, userGrowthRate: 0 };
    }),
    fetchMonthlyStreamCreation().catch((err) => {
      console.error("Error fetching monthly stream creation:", err);
      return [];
    }),
    fetchStreamDurationStats().catch((err) => {
      console.error("Error fetching stream duration stats:", err);
      return { average: 0, max: 0, median: 0, min: 0 };
    }),
    fetchStreamProperties().catch((err) => {
      console.error("Error fetching stream properties:", err);
      return { both: 0, cancelable: 0, total: 0, transferable: 0 };
    }),
    fetchStreamCategoryDistribution().catch((err) => {
      console.error("Error fetching stream category distribution:", err);
      return { dynamic: 0, linear: 0, total: 0, tranched: 0 };
    }),
    fetchTotalVestingStreams().catch((err) => {
      console.error("Error fetching total vesting streams:", err);
      return 0;
    }),
    fetchActiveVsCompletedStreams().catch((err) => {
      console.error("Error fetching active vs completed streams:", err);
      return { active: 0, completed: 0, total: 0 };
    }),
    fetchLargestStablecoinStreams()
      .then((streams) => optimizeStablecoinStreams(streams))
      .catch((err) => {
        console.error("Error fetching largest stablecoin streams:", err);
        return [];
      }),
    fetchAggregated24HourMetrics().catch((err) => {
      console.error("Error fetching aggregated 24-hour metrics:", err);
      return { streamsCreated: 0, totalTransactions: 0, claimsCreated: 0 };
    }),
  ]);

  // Prepare the raw cached data
  const timestamp = new Date().toISOString();
  const rawCachedData = {
    activeVsCompletedStreams,
    activity24Hours,
    chainDistribution,
    growthRateMetrics,
    largestStablecoinStreams,
    lastUpdated: timestamp,
    monthlyStreamCreation,
    monthlyTransactionGrowth,
    monthlyUserGrowth,
    streamCategoryDistribution,
    streamDurationStats,
    streamProperties,
    timeBasedTransactions,
    timeBasedUsers,
    topAssets,
    totalTransactions,
    totalUsers,
    totalVestingStreams,
  };

  // Apply optimizations to reduce storage size
  const optimizedCachedData = optimizeAnalyticsCache(rawCachedData);

  // Validate cache size and log summary
  console.log("📊 Cache optimization summary:");
  console.log("   Raw data:", createCacheSummary(rawCachedData));
  console.log("   Optimized data:", createCacheSummary(optimizedCachedData));

  const isValidSize = validateCacheSize(optimizedCachedData, "analytics");
  if (!isValidSize) {
    console.error("❌ Cache size validation failed - data may be too large for Edge Config");
  }

  // Store in Edge Config using Vercel REST API
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

  if (!edgeConfigId || !vercelAccessToken) {
    throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
  }

  const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
    body: JSON.stringify({
      items: [
        {
          key: "analytics",
          operation: "upsert",
          value: optimizedCachedData,
        },
      ],
    }),
    headers: {
      Authorization: `Bearer ${vercelAccessToken}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Edge Config: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (result.status !== "ok") {
    throw new Error(`Edge Config update failed: ${JSON.stringify(result)}`);
  }

  console.log("✅ Optimized cache update completed successfully");

  return {
    dataPoints: {
      chainDistribution: optimizedCachedData.chainDistribution.length,
      monthlyTransactionGrowth: optimizedCachedData.monthlyTransactionGrowth.length,
      monthlyUserGrowth: optimizedCachedData.monthlyUserGrowth.length,
      stablecoinStreams: optimizedCachedData.largestStablecoinStreams.length,
      topAssets: optimizedCachedData.topAssets.length,
      totalTransactions,
      totalUsers,
    },
    lastUpdated: timestamp,
    message: "Optimized cache updated successfully",
    optimizations: {
      monthlyDataLimited: CACHE_LIMITS.MONTHLY_DATA_MONTHS + " months",
      stablecoinStreamsLimit: CACHE_LIMITS.TOP_STABLECOIN_STREAMS,
      topAssetsLimit: CACHE_LIMITS.TOP_ASSETS_LIMIT,
    },
    success: true,
  };
}
