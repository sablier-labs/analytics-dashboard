import { NextRequest, NextResponse } from "next/server";
import {
  fetchTotalUsers,
  fetchTotalTransactions,
  fetchTimeBasedUserCounts,
  fetchTimeBasedTransactionCounts,
  fetchMonthlyUserGrowth,
  fetchChainDistribution,
  fetchMonthlyTransactionGrowth,
  fetchAverageTransactionsPerUser,
  fetchDailyTransactionVolume,
  fetchGrowthRateMetrics,
} from "@/lib/services/graphql";

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow Vercel Cron requests
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }
  
  // Allow requests with correct API key
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
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
      averageTransactionsPerUser,
      dailyTransactionVolume,
      growthRateMetrics,
    ] = await Promise.all([
      fetchTotalUsers().catch(err => {
        console.error("Error fetching total users:", err);
        return 0;
      }),
      fetchTotalTransactions().catch(err => {
        console.error("Error fetching total transactions:", err);
        return 0;
      }),
      fetchTimeBasedUserCounts().catch(err => {
        console.error("Error fetching time-based users:", err);
        return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
      }),
      fetchTimeBasedTransactionCounts().catch(err => {
        console.error("Error fetching time-based transactions:", err);
        return { past30Days: 0, past90Days: 0, past180Days: 0, pastYear: 0 };
      }),
      fetchMonthlyUserGrowth().catch(err => {
        console.error("Error fetching monthly user growth:", err);
        return [];
      }),
      fetchChainDistribution().catch(err => {
        console.error("Error fetching chain distribution:", err);
        return [];
      }),
      fetchMonthlyTransactionGrowth().catch(err => {
        console.error("Error fetching monthly transaction growth:", err);
        return [];
      }),
      fetchAverageTransactionsPerUser().catch(err => {
        console.error("Error fetching average transactions per user:", err);
        return 0;
      }),
      fetchDailyTransactionVolume(30).catch(err => {
        console.error("Error fetching daily transaction volume:", err);
        return [];
      }),
      fetchGrowthRateMetrics().catch(err => {
        console.error("Error fetching growth rate metrics:", err);
        return { userGrowthRate: 0, transactionGrowthRate: 0, averageTransactionGrowthRate: 0 };
      }),
    ]);

    // Prepare the cached data
    const cachedData = {
      totalUsers,
      totalTransactions,
      timeBasedUsers,
      timeBasedTransactions,
      monthlyUserGrowth,
      chainDistribution,
      monthlyTransactionGrowth,
      averageTransactionsPerUser,
      dailyTransactionVolume,
      growthRateMetrics,
      lastUpdated: new Date().toISOString(),
    };

    // Store in Edge Config using Vercel REST API
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

    if (!edgeConfigId || !vercelAccessToken) {
      throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
    }

    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              operation: "upsert",
              key: "analytics",
              value: cachedData,
            },
          ],
        }),
      }
    );

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
      success: true,
      message: "Cache updated successfully",
      lastUpdated: cachedData.lastUpdated,
      dataPoints: {
        totalUsers,
        totalTransactions,
        chainDistribution: chainDistribution.length,
        monthlyUserGrowth: monthlyUserGrowth.length,
        monthlyTransactionGrowth: monthlyTransactionGrowth.length,
        dailyTransactionVolume: dailyTransactionVolume.length,
      },
    });
  } catch (error) {
    console.error("Error updating cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET requests for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}