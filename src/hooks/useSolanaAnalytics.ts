import { useCallback, useEffect, useState } from "react";

interface SolanaAnalyticsData {
  mau: number;
  totalUsers: number;
  totalStreams: number;
  totalCampaigns: number;
  topSPLTokens: Array<{
    symbol: string;
    name: string;
    streamCount: number;
  }>;
  totalTransactions: number;
  streams24h: number;
  claims24h: number;
  lastUpdated: string;
}

export function useSolanaAnalytics() {
  const [data, setData] = useState<SolanaAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSolanaAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/solana-analytics");
      if (!response.ok) {
        throw new Error(`Failed to fetch Solana analytics: ${response.statusText}`);
      }
      const solanaData = await response.json();
      setData(solanaData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load Solana analytics"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSolanaAnalytics();
  }, [loadSolanaAnalytics]);

  const refetch = () => loadSolanaAnalytics();

  return { data, error, isLoading, refetch };
}
