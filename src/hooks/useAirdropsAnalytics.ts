import { useCallback, useEffect, useState } from "react";
import type {
  MonthlyCampaignCreation,
  RecipientParticipation,
  VestingDistribution,
  ChainDistribution,
} from "@/lib/services/airdrops-graphql";

interface AirdropsAnalyticsData {
  totalCampaigns: number;
  monthlyCampaignCreation: MonthlyCampaignCreation[];
  recipientParticipation: RecipientParticipation;
  medianClaimers: number;
  medianClaimWindow: number;
  vestingDistribution: VestingDistribution;
  chainDistribution: ChainDistribution[];
}

export function useAirdropsAnalytics() {
  const [data, setData] = useState<AirdropsAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAirdropsAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/airdrops-analytics");
      if (!response.ok) {
        throw new Error(`Failed to fetch airdrops analytics: ${response.statusText}`);
      }
      const airdropsData = await response.json();
      setData(airdropsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load airdrops analytics"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAirdropsAnalytics();
  }, [loadAirdropsAnalytics]);

  const refetch = () => loadAirdropsAnalytics();

  return { data, error, isLoading, refetch };
}
