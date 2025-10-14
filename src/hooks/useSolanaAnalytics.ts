import { useCallback, useEffect, useState } from "react";

interface SolanaAnalyticsData {
  mau: number;
  totalUsers: number;
  totalStreams: number;
  totalCampaigns: number;
  topSPLTokens: Array<{
    mint: string;
    address: string;
    streamCount: number;
    symbol?: string;
    name?: string;
    logoURI?: string;
  }>;
  totalTransactions: number;
  streams24h: number;
  claims24h: number;
  lastUpdated: string;
}

export function useSolanaAnalytics() {
  const [data, setData] = useState<SolanaAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSolanaAnalytics = useCallback(async (bustCache = false) => {
    try {
      if (bustCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const url = bustCache ? `/api/solana-analytics?t=${Date.now()}` : "/api/solana-analytics";
      const response = await fetch(url, {
        cache: bustCache ? "no-store" : "default",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch Solana analytics: ${response.statusText}`);
      }
      const solanaData = await response.json();
      setData(solanaData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load Solana analytics"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSolanaAnalytics();
  }, [loadSolanaAnalytics]);

  const refetch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await loadSolanaAnalytics(true);
  };

  return { data, error, isLoading, isRefreshing, refetch };
}
