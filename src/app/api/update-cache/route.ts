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

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // TEMPORARY: Allow manual trigger for immediate cache update
  const url = new URL(request.url);
  if (url.searchParams.get("manual") === "trigger-now-2025") {
    return true;
  }

  // Allow Vercel Cron requests
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }

  // Allow requests with correct API key
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Allow internal requests (for manual refresh)
  const userAgent = request.headers.get("user-agent");
  if (userAgent && userAgent.includes("undici")) {
    return true;
  }

  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Verify the request is authorized
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting cache update...");

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
      throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
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

    console.log("Cache update completed successfully");

    return NextResponse.json({
      dataPoints: {
        chainDistribution: chainDistribution.length,
        monthlyTransactionGrowth: monthlyTransactionGrowth.length,
        monthlyUserGrowth: monthlyUserGrowth.length,
        topAssets: topAssets.length,
        totalTransactions,
        totalUsers,
      },
      lastUpdated: cachedData.lastUpdated,
      message: "Cache updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating cache:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to update cache",
        success: false,
      },
      { status: 500 },
    );
  }
}

// Also allow GET requests for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
