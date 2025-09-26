import { useQuery } from "@tanstack/react-query";
import type {
  MonthlyCampaignCreation,
  RecipientParticipation,
} from "@/lib/services/airdrops-graphql";

interface AirdropsAnalyticsData {
  totalCampaigns: number;
  monthlyCampaignCreation: MonthlyCampaignCreation[];
  recipientParticipation: RecipientParticipation;
}

async function fetchAirdropsAnalytics(): Promise<AirdropsAnalyticsData> {
  const response = await fetch("/api/airdrops-analytics");

  if (!response.ok) {
    throw new Error(`Failed to fetch airdrops analytics: ${response.statusText}`);
  }

  return response.json();
}

export function useAirdropsAnalytics() {
  return useQuery({
    queryFn: fetchAirdropsAnalytics,
    queryKey: ["airdrops-analytics"],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
