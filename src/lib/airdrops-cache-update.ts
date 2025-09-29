import type { OptimizedTopPerformingCampaign } from "./services/airdrops-graphql";
import {
  fetchChainDistribution,
  fetchMedianClaimers,
  fetchMedianClaimWindow,
  fetchMonthlyCampaignCreation,
  fetchRecipientParticipation,
  fetchTotalCampaigns,
  fetchTopPerformingCampaigns,
  fetchVestingDistribution,
} from "./services/airdrops-graphql";
import {
  optimizeAirdropsCache,
  validateCacheSize,
  createCacheSummary,
  CACHE_LIMITS,
} from "./cache-optimization";

function optimizeTopPerformingCampaigns(campaigns: any[]): OptimizedTopPerformingCampaign[] {
  // Keep only essential fields and limit to top campaigns
  return campaigns
    .slice(0, CACHE_LIMITS.TOP_CAMPAIGNS_LIMIT)
    .map((campaign) => ({
      id: campaign.id,
      chainId: campaign.chainId,
      chainName: campaign.chainName,
      claimedCount: campaign.claimedCount,
      totalRecipients: campaign.totalRecipients,
      claimRate: campaign.claimRate,
      // Remove timestamp, expiration, admin fields to save space
    }));
}

export async function updateAirdropsCache() {
  console.log("🪂 Starting optimized airdrops cache update...");

  // Fetch all airdrops data in parallel
  const [
    totalCampaigns,
    monthlyCampaignCreation,
    recipientParticipation,
    medianClaimers,
    medianClaimWindow,
    vestingDistribution,
    chainDistribution,
    topPerformingCampaigns,
  ] = await Promise.all([
    fetchTotalCampaigns().catch((err) => {
      console.error("Error fetching total campaigns:", err);
      return 0;
    }),
    fetchMonthlyCampaignCreation().catch((err) => {
      console.error("Error fetching monthly campaign creation:", err);
      return [];
    }),
    fetchRecipientParticipation().catch((err) => {
      console.error("Error fetching recipient participation:", err);
      return { percentage: 0, campaignCount: 0 };
    }),
    fetchMedianClaimers().catch((err) => {
      console.error("Error fetching median claimers:", err);
      return 0;
    }),
    fetchMedianClaimWindow().catch((err) => {
      console.error("Error fetching median claim window:", err);
      return 0;
    }),
    fetchVestingDistribution().catch((err) => {
      console.error("Error fetching vesting distribution:", err);
      return { instant: 0, vesting: 0 };
    }),
    fetchChainDistribution().catch((err) => {
      console.error("Error fetching chain distribution:", err);
      return [];
    }),
    fetchTopPerformingCampaigns()
      .then((campaigns) => optimizeTopPerformingCampaigns(campaigns))
      .catch((err) => {
        console.error("Error fetching top performing campaigns:", err);
        return [];
      }),
  ]);

  // Prepare the raw cached data
  const rawCachedData = {
    totalCampaigns,
    monthlyCampaignCreation,
    recipientParticipation,
    medianClaimers,
    medianClaimWindow,
    vestingDistribution,
    chainDistribution,
    topPerformingCampaigns,
    lastUpdated: new Date().toISOString(),
  };

  // Apply optimizations to reduce storage size
  const optimizedCachedData = optimizeAirdropsCache(rawCachedData);

  // Validate cache size and log summary
  console.log("📊 Airdrops cache optimization summary:");
  console.log("   Raw data:", createCacheSummary(rawCachedData));
  console.log("   Optimized data:", createCacheSummary(optimizedCachedData));

  const isValidSize = validateCacheSize(optimizedCachedData, "airdrops");
  if (!isValidSize) {
    console.error("❌ Airdrops cache size validation failed - data may be too large for Edge Config");
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
          key: "airdrops",
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

  console.log("✅ Optimized airdrops cache update completed successfully");

  return {
    dataPoints: {
      totalCampaigns,
      monthlyCampaignCreation: optimizedCachedData.monthlyCampaignCreation.length,
      chainDistribution: optimizedCachedData.chainDistribution.length,
      topPerformingCampaigns: optimizedCachedData.topPerformingCampaigns.length,
      medianClaimers,
      medianClaimWindow,
    },
    lastUpdated: optimizedCachedData.lastUpdated,
    message: "Optimized airdrops cache updated successfully",
    optimizations: {
      monthlyDataLimited: CACHE_LIMITS.AIRDROP_MONTHLY_MONTHS + " months",
      topCampaignsLimit: CACHE_LIMITS.TOP_CAMPAIGNS_LIMIT,
      chainDistributionLimit: CACHE_LIMITS.AIRDROP_CHAIN_LIMIT,
    },
    success: true,
  };
}