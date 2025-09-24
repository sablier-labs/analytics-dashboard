import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { CachedAnalyticsData } from "@/lib/services/cache";
import {
  fetchTotalVestingStreams,
  fetchLargestStablecoinStreams,
  fetchTotalUsers,
  fetchTotalTransactions,
} from "@/lib/services/graphql";

export async function GET() {
  let cached: CachedAnalyticsData | undefined;

  // Try to get cached data, but don't fail if Edge Config is not available
  try {
    cached = await get<CachedAnalyticsData>("analytics");
  } catch (error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Edge Config not available - fall back to direct GraphQL fetching for development
  try {
    console.log("Fetching data directly from GraphQL");

    const [totalVestingStreams, largestStablecoinStreams, totalUsers, totalTransactions] = await Promise.all([
      fetchTotalVestingStreams().catch(() => 0),
      fetchLargestStablecoinStreams().catch(() => []),
      fetchTotalUsers().catch(() => 0),
      fetchTotalTransactions().catch(() => 0),
    ]);

    const fallbackData: CachedAnalyticsData = {
      totalVestingStreams,
      largestStablecoinStreams,
      totalUsers,
      totalTransactions,
      // Provide minimal data for other required fields
      topAssets: [],
      streamCategoryDistribution: { total: 0, linear: 0, dynamic: 0, tranched: 0 },
      activeCompletedStreams: { total: 0, active: 0, completed: 0 },
      streamProperties: { total: 0, cancelable: 0, transferable: 0, both: 0 },
      streamDurationStats: { median: 0, average: 0, min: 0, max: 0 },
      monthlyStreamCreation: [],
      activity24Hours: { streamsCreated: 0, totalTransactions: 0 },
      chainDistribution: [],
      timeBasedUserCounts: { today: 0, thisWeek: 0, thisMonth: 0, thisYear: 0 },
      timeBasedTransactionCounts: { today: 0, thisWeek: 0, thisMonth: 0, thisYear: 0 },
      userGrowthMetrics: { totalUsers: 0, monthlyGrowth: [] },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
