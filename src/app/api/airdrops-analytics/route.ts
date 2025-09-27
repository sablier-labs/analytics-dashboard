import { NextResponse } from "next/server";
import {
  fetchMonthlyCampaignCreation,
  fetchRecipientParticipation,
  fetchTotalCampaigns,
  fetchMedianClaimers,
  fetchMedianClaimWindow,
  fetchVestingDistribution,
  fetchChainDistribution,
} from "@/lib/services/airdrops-graphql";

export async function GET() {
  try {
    // Fetch all seven metrics in parallel for efficiency
    const [
      totalCampaigns,
      monthlyCampaignCreation,
      recipientParticipation,
      medianClaimers,
      medianClaimWindow,
      vestingDistribution,
      chainDistribution,
    ] = await Promise.all([
      fetchTotalCampaigns(),
      fetchMonthlyCampaignCreation(),
      fetchRecipientParticipation(),
      fetchMedianClaimers(),
      fetchMedianClaimWindow(),
      fetchVestingDistribution(),
      fetchChainDistribution(),
    ]);

    return NextResponse.json({
      monthlyCampaignCreation,
      recipientParticipation,
      totalCampaigns,
      medianClaimers,
      medianClaimWindow,
      vestingDistribution,
      chainDistribution,
    });
  } catch (error) {
    console.error("Error fetching airdrops analytics:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops analytics" }, { status: 500 });
  }
}
