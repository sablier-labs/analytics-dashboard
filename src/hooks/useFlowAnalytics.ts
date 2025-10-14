import { useCallback, useEffect, useState } from "react";

interface FlowAnalyticsData {
  lastUpdated: string;
  totalDeposits: number;
}

export function useFlowAnalytics() {
  const [data, setData] = useState<FlowAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadFlowAnalytics = useCallback(async (bustCache = false) => {
    try {
      if (bustCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const url = bustCache ? `/api/flow-analytics?t=${Date.now()}` : "/api/flow-analytics";
      const response = await fetch(url, {
        cache: bustCache ? "no-store" : "default",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch Flow analytics: ${response.statusText}`);
      }
      const flowData = await response.json();
      setData(flowData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load Flow analytics"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFlowAnalytics();
  }, [loadFlowAnalytics]);

  const refetch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await loadFlowAnalytics(true);
  };

  return { data, error, isLoading, isRefreshing, refetch };
}
