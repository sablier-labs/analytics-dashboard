import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  fetchActiveVsCompletedStreams,
  fetchChainDistribution,
  fetchGrowthRateMetrics,
  fetchMonthlyStreamCreation,
  fetchMonthlyTransactionGrowth,
  fetchMonthlyUserGrowth,
  fetchStreamCategoryDistribution,
  fetchStreamDurationStats,
  fetchStreamProperties,
  fetchTimeBasedTransactionCounts,
  fetchTimeBasedUserCounts,
  fetchTopAssetsByStreamCount,
  fetchTotalTransactions,
  fetchTotalUsers,
  fetchTotalVestingStreams,
} from "@/lib/services/graphql";

// Public endpoint for immediate cache update - no auth required for emergency fix
export async function POST(request: NextRequest) {
  try {
    console.log("Starting emergency cache update...");

    // Test that the timestamp fixes work first
    const testResult = await fetchTimeBasedUserCounts().catch((err) => {
      console.error("Timestamp fix test failed:", err.message);
      throw new Error(`Timestamp format still broken: ${err.message}`);
    });

    console.log("Timestamp fix verified, proceeding with full cache update");

    // Fetch all analytics data in parallel
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
    ] = await Promise.all([
      fetchTotalUsers().catch((err) => {
        console.error("Error fetching total users:", err);
        return 0;
      }),
      fetchTotalTransactions().catch((err) => {
        console.error("Error fetching total transactions:", err);
        return 0;
      }),
      fetchTimeBasedUserCounts().catch((err) => {
        console.error("Error fetching time-based users:", err);
        return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
      }),
      fetchTimeBasedTransactionCounts().catch((err) => {
        console.error("Error fetching time-based transactions:", err);
        return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
      }),
      fetchMonthlyUserGrowth().catch((err) => {
        console.error("Error fetching monthly user growth:", err);
        return [];
      }),
      fetchChainDistribution().catch((err) => {
        console.error("Error fetching chain distribution:", err);
        return [];
      }),
      fetchMonthlyTransactionGrowth().catch((err) => {
        console.error("Error fetching monthly transaction growth:", err);
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
        return { median: 0, average: 0, min: 0, max: 0 };
      }),
      fetchStreamProperties().catch((err) => {
        console.error("Error fetching stream properties:", err);
        return { cancelable: 0, transferable: 0, both: 0, total: 0 };
      }),
      fetchStreamCategoryDistribution().catch((err) => {
        console.error("Error fetching stream category distribution:", err);
        return { linear: 0, dynamic: 0, tranched: 0, total: 0 };
      }),
      fetchTotalVestingStreams().catch((err) => {
        console.error("Error fetching total vesting streams:", err);
        return 0;
      }),
      fetchActiveVsCompletedStreams().catch((err) => {
        console.error("Error fetching active vs completed streams:", err);
        return { active: 0, completed: 0, total: 0 };
      }),
    ]);

    // Prepare the cached data
    const cachedData = {
      activeVsCompletedStreams,
      chainDistribution,
      growthRateMetrics,
      lastUpdated: new Date().toISOString(),
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

    // Store in Edge Config using Vercel REST API
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

    if (!edgeConfigId || !vercelAccessToken) {
      // In development, just return the data - can't update Edge Config
      console.log("Edge Config credentials not available - returning data only");
      return NextResponse.json({
        success: true,
        message: "Emergency cache update completed (local only)",
        data: cachedData,
        warning: "Could not update production Edge Config - missing credentials",
      });
    }

    const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      body: JSON.stringify({
        items: [
          {
            key: "analytics",
            operation: "upsert",
            value: cachedData,
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

    console.log("Emergency cache update completed successfully");

    return NextResponse.json({
      success: true,
      message: "Emergency cache update completed successfully",
      lastUpdated: cachedData.lastUpdated,
      dataPoints: {
        chainDistribution: chainDistribution.length,
        monthlyTransactionGrowth: monthlyTransactionGrowth.length,
        monthlyUserGrowth: monthlyUserGrowth.length,
        timeBasedUsers,
        growthRateMetrics,
        totalTransactions,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error in emergency cache update:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Emergency cache update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}