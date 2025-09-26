import { NextResponse } from "next/server";
import {
  fetchMonthlyCampaignCreation,
  fetchRecipientParticipation,
  fetchTotalCampaigns,
} from "@/lib/services/airdrops-graphql";

export async function GET() {
  try {
    // Fetch all three metrics in parallel for efficiency
    const [totalCampaigns, monthlyCampaignCreation, recipientParticipation] = await Promise.all([
      fetchTotalCampaigns(),
      fetchMonthlyCampaignCreation(),
      fetchRecipientParticipation(),
    ]);

    return NextResponse.json({
      monthlyCampaignCreation,
      recipientParticipation,
      totalCampaigns,
    });
  } catch (error) {
    console.error("Error fetching airdrops analytics:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops analytics" }, { status: 500 });
  }
}
