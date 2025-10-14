import { useCallback, useEffect, useState } from "react";
import type {
  ChainDistribution,
  MonthlyCampaignCreation,
  MonthlyClaimTrend,
  RecipientParticipation,
  TopPerformingCampaign,
  VestingDistribution,
} from "@/lib/services/airdrops-graphql";

interface AirdropsAnalyticsData {
  totalCampaigns: number;
  monthlyCampaignCreation: MonthlyCampaignCreation[];
  monthlyClaimTrends: MonthlyClaimTrend[];
  recipientParticipation: RecipientParticipation;
  medianClaimers: number;
  medianClaimWindow: number;
  vestingDistribution: VestingDistribution;
  chainDistribution: ChainDistribution[];
  topPerformingCampaigns: TopPerformingCampaign[];
}

export function useAirdropsAnalytics() {
  const [data, setData] = useState<AirdropsAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAirdropsAnalytics = useCallback(async (bustCache = false) => {
    try {
      if (bustCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const url = bustCache ? `/api/airdrops-analytics?t=${Date.now()}` : "/api/airdrops-analytics";
      const response = await fetch(url, {
        cache: bustCache ? "no-store" : "default",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch airdrops analytics: ${response.statusText}`);
      }
      const airdropsData = await response.json();
      setData(airdropsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load airdrops analytics"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAirdropsAnalytics();
  }, [loadAirdropsAnalytics]);

  const refetch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await loadAirdropsAnalytics(true);
  };

  return { data, error, isLoading, isRefreshing, refetch };
}
