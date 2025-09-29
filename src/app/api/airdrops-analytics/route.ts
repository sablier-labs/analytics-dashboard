import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { CachedAirdropsData, OptimizedTopPerformingCampaign } from "@/lib/services/airdrops-graphql";
import {
  fetchChainDistribution,
  fetchMedianClaimers,
  fetchMedianClaimWindow,
  fetchMonthlyCampaignCreation,
  fetchRecipientParticipation,
  fetchTotalCampaigns,
  fetchTopPerformingCampaigns,
  fetchVestingDistribution,
} from "@/lib/services/airdrops-graphql";

export async function GET() {
  let cached: CachedAirdropsData | undefined;

  // Try to get cached data, but don't fail if Edge Config is not available
  try {
    cached = await get<CachedAirdropsData>("airdrops");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    // Convert optimized campaigns back to full campaigns for API consistency
    const topPerformingCampaigns = cached.topPerformingCampaigns.map((campaign) => ({
      ...campaign,
      timestamp: "", // Default value - not needed for display
      expiration: "", // Default value - not needed for display
      admin: "", // Default value - not needed for display
    }));

    return NextResponse.json({
      chainDistribution: cached.chainDistribution,
      medianClaimers: cached.medianClaimers,
      medianClaimWindow: cached.medianClaimWindow,
      monthlyCampaignCreation: cached.monthlyCampaignCreation,
      recipientParticipation: cached.recipientParticipation,
      topPerformingCampaigns,
      totalCampaigns: cached.totalCampaigns,
      vestingDistribution: cached.vestingDistribution,
    });
  }

  // Edge Config not available - fall back to direct GraphQL fetching for development
  try {
    console.log("Fetching airdrops data directly from GraphQL");

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
      fetchTotalCampaigns().catch(() => 0),
      fetchMonthlyCampaignCreation().catch(() => []),
      fetchRecipientParticipation().catch(() => ({ percentage: 0, campaignCount: 0 })),
      fetchMedianClaimers().catch(() => 0),
      fetchMedianClaimWindow().catch(() => 0),
      fetchVestingDistribution().catch(() => ({ instant: 0, vesting: 0 })),
      fetchChainDistribution().catch(() => []),
      fetchTopPerformingCampaigns().catch(() => []),
    ]);

    const fallbackData = {
      chainDistribution,
      medianClaimers,
      medianClaimWindow,
      monthlyCampaignCreation,
      recipientParticipation,
      topPerformingCampaigns,
      totalCampaigns,
      vestingDistribution,
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Error fetching airdrops analytics:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops analytics" }, { status: 500 });
  }
}
