import { NextResponse } from "next/server";
import {
  getCachedTotalUsers,
  getCachedTotalTransactions,
  getCachedTimeBasedUserCounts,
  getCachedTimeBasedTransactionCounts,
  getCachedMonthlyUserGrowth,
  getCachedChainDistribution,
  getCachedMonthlyTransactionGrowth,
  getCachedAverageTransactionsPerUser,
  getCachedDailyTransactionVolume,
  getCachedGrowthRateMetrics,
} from "@/lib/services/cache";

export async function GET() {
  try {
    // Fetch all analytics data from cache (with fallbacks to GraphQL)
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
      getCachedTotalUsers(),
      getCachedTotalTransactions(),
      getCachedTimeBasedUserCounts(),
      getCachedTimeBasedTransactionCounts(),
      getCachedMonthlyUserGrowth(),
      getCachedChainDistribution(),
      getCachedMonthlyTransactionGrowth(),
      getCachedAverageTransactionsPerUser(),
      getCachedDailyTransactionVolume(),
      getCachedGrowthRateMetrics(),
    ]);

    return NextResponse.json({
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error serving analytics data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Cache for better performance
export const revalidate = 300;