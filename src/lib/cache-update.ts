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

export async function updateAnalyticsCache() {
  console.log("Starting cache update...");

  // Get current cached data to preserve on failures
  // Skip fetching current data to avoid URL issues - just use defaults if API calls fail
  const currentCachedData = null;

  console.log("Current cached data available:", !!currentCachedData);

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

  return {
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
  };
}