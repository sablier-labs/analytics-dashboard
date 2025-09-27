import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import { isTestnetChain } from "@/lib/constants/chains";
import type { CachedAnalyticsData, OptimizedStablecoinStream } from "@/lib/services/cache";
import {
  fetchLargestStablecoinStreams,
  fetchTotalTransactions,
  fetchTotalUsers,
  fetchTotalVestingStreams,
} from "@/lib/services/graphql";
import { normalizeAmount } from "@/lib/utils/sablier";

export async function GET() {
  let cached: CachedAnalyticsData | undefined;

  // Try to get cached data, but don't fail if Edge Config is not available
  try {
    cached = await get<CachedAnalyticsData>("analytics");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Edge Config not available - fall back to direct GraphQL fetching for development
  try {
    console.log("Fetching data directly from GraphQL");

    const [totalVestingStreams, allStablecoinStreams, totalUsers, totalTransactions] =
      await Promise.all([
        fetchTotalVestingStreams().catch(() => 0),
        fetchLargestStablecoinStreams().catch(() => []),
        fetchTotalUsers().catch(() => 0),
        fetchTotalTransactions().catch(() => 0),
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
      activeVsCompletedStreams: { active: 0, completed: 0, total: 0 },
      activity24Hours: { streamsCreated: 0, totalTransactions: 0 },
      chainDistribution: [],
      growthRateMetrics: {
        averageTransactionGrowthRate: 0,
        transactionGrowthRate: 0,
        userGrowthRate: 0,
      },
      largestStablecoinStreams: optimizedStreams,
      lastUpdated: new Date().toISOString(),
      monthlyStreamCreation: [],
      monthlyTransactionGrowth: [],
      monthlyUserGrowth: [],
      streamCategoryDistribution: { dynamic: 0, linear: 0, total: 0, tranched: 0 },
      streamDurationStats: { average: 0, max: 0, median: 0, min: 0 },
      streamProperties: { both: 0, cancelable: 0, total: 0, transferable: 0 },
      timeBasedTransactions: { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 },
      timeBasedUsers: { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 },
      // Provide minimal data for other required fields
      topAssets: [],
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
