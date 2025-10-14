import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import { isTestnetChain } from "@/lib/constants/chains";
import {
  fetchAggregated24HourMetrics,
  fetchAggregatedMonthlyTransactionGrowth,
  fetchAggregatedMonthlyUserGrowth,
  fetchAggregatedTimeBasedTransactionCounts,
  fetchAggregatedTimeBasedUserCounts,
  fetchAggregatedTotalClaims,
  fetchAggregatedTotalTransactions,
  fetchAggregatedTotalUsers,
} from "@/lib/services/aggregated-graphql";
import type { CachedAnalyticsData, OptimizedStablecoinStream } from "@/lib/services/cache";
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
import {
  fetchTimeBasedStablecoinVolume,
  fetchTotalStablecoinVolume,
} from "@/lib/services/stablecoin-volume-aggregate";
import { normalizeAmount } from "@/lib/utils/sablier";

// Maximum cache age in milliseconds (48 hours)
const MAX_CACHE_AGE_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  let cached: CachedAnalyticsData | undefined;

  // Try to get cached data, but don't fail if Edge Config is not available
  try {
    cached = await get<CachedAnalyticsData>("analytics");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  // CRITICAL: Check cache staleness to prevent serving outdated data
  if (cached) {
    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
    const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

    if (cacheAge > MAX_CACHE_AGE_MS) {
      console.warn(
        `⚠️  Cache is stale (${cacheAgeHours} hours old, max ${MAX_CACHE_AGE_MS / (1000 * 60 * 60)} hours). Falling back to direct fetch.`,
      );
      cached = undefined; // Force fallback to fresh data
    } else {
      console.log(`✅ Serving fresh cached data (${cacheAgeHours} hours old)`);
    }
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Edge Config not available - fall back to direct GraphQL fetching for development
  try {
    console.log("Fetching data directly from GraphQL");

    const [
      totalUsers,
      totalTransactions,
      totalClaims,
      totalStablecoinVolumeBreakdown,
      timeBasedStablecoinVolume,
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
      allStablecoinStreams,
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
      fetchAggregatedTotalClaims().catch((err) => {
        console.error("Error fetching aggregated total claims:", err);
        return 0;
      }),
      fetchTotalStablecoinVolume().catch((err) => {
        console.error("Error fetching total stablecoin volume:", err);
        return {
          evmAirdrops: 0,
          evmFlow: 0,
          evmLockup: 0,
          solanaAirdrops: 0,
          solanaLockup: 0,
          total: 0,
        };
      }),
      fetchTimeBasedStablecoinVolume().catch((err) => {
        console.error("Error fetching time-based stablecoin volume:", err);
        return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
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
      fetchLargestStablecoinStreams().catch((err) => {
        console.error("Error fetching largest stablecoin streams:", err);
        return [];
      }),
      fetchAggregated24HourMetrics().catch((err) => {
        console.error("Error fetching aggregated 24-hour metrics:", err);
        return { claimsCreated: 0, streamsCreated: 0, totalTransactions: 0 };
      }),
    ]);

    // Optimize stablecoin streams (same logic as cache-update.ts)
    const optimizedStreams = allStablecoinStreams
      .filter((stream) => !isTestnetChain(stream.chainId))
      .map((stream) => ({
        ...stream,
        normalizedAmount: normalizeAmount(stream.depositAmount, stream.asset.decimals),
      }))
      .sort((a, b) => {
        if (a.normalizedAmount > b.normalizedAmount) return -1;
        if (a.normalizedAmount < b.normalizedAmount) return 1;
        return 0;
      })
      .slice(0, 25)
      .map((stream) => ({
        asset: {
          decimals: stream.asset.decimals,
          symbol: stream.asset.symbol,
        },
        chainId: stream.chainId,
        contract: stream.contract,
        depositAmount: stream.depositAmount,
        endTime: stream.endTime,
        id: stream.id,
        startTime: stream.startTime,
        tokenId: stream.tokenId,
      })) as OptimizedStablecoinStream[];

    const fallbackData: CachedAnalyticsData = {
      activeVsCompletedStreams,
      activity24Hours,
      chainDistribution,
      growthRateMetrics,
      largestStablecoinStreams: optimizedStreams,
      lastUpdated: new Date().toISOString(),
      monthlyStreamCreation,
      monthlyTransactionGrowth,
      monthlyUserGrowth,
      streamCategoryDistribution,
      streamDurationStats,
      streamProperties,
      timeBasedStablecoinVolume,
      timeBasedTransactions,
      timeBasedUsers,
      topAssets,
      totalClaims,
      totalStablecoinVolume: totalStablecoinVolumeBreakdown.total,
      totalTransactions,
      totalUsers,
      totalVestingStreams,
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
