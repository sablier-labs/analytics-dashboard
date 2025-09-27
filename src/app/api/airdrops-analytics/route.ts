import { NextResponse } from "next/server";
import {
  fetchChainDistribution,
  fetchMedianClaimers,
  fetchMedianClaimWindow,
  fetchMonthlyCampaignCreation,
  fetchRecipientParticipation,
  fetchTotalCampaigns,
  fetchTopPerformingCampaigns,
  fetchVestingDistribution,
  fetchCampaignCompletionRate,
  fetchAdminLeaderboard,
} from "@/lib/services/airdrops-graphql";

export async function GET() {
  try {
    // Fetch all ten metrics in parallel for efficiency
    const [
      totalCampaigns,
      monthlyCampaignCreation,
      recipientParticipation,
      medianClaimers,
      medianClaimWindow,
      vestingDistribution,
      chainDistribution,
      topPerformingCampaigns,
      campaignCompletionRate,
      adminLeaderboard,
    ] = await Promise.all([
      fetchTotalCampaigns(),
      fetchMonthlyCampaignCreation(),
      fetchRecipientParticipation(),
      fetchMedianClaimers(),
      fetchMedianClaimWindow(),
      fetchVestingDistribution(),
      fetchChainDistribution(),
      fetchTopPerformingCampaigns(),
      fetchCampaignCompletionRate(),
      fetchAdminLeaderboard(),
    ]);

    return NextResponse.json({
      chainDistribution,
      medianClaimers,
      medianClaimWindow,
      monthlyCampaignCreation,
      recipientParticipation,
      topPerformingCampaigns,
      totalCampaigns,
      vestingDistribution,
      campaignCompletionRate,
      adminLeaderboard,
    });
  } catch (error) {
    console.error("Error fetching airdrops analytics:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops analytics" }, { status: 500 });
  }
}
