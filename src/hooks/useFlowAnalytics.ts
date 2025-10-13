import { useCallback, useEffect, useState } from "react";

interface FlowAnalyticsData {
  lastUpdated: string;
  totalDeposits: number;
}

export function useFlowAnalytics() {
  const [data, setData] = useState<FlowAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFlowAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/flow-analytics");
      if (!response.ok) {
        throw new Error(`Failed to fetch Flow analytics: ${response.statusText}`);
      }
      const flowData = await response.json();
      setData(flowData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load Flow analytics"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFlowAnalytics();
  }, [loadFlowAnalytics]);

  const refetch = () => loadFlowAnalytics();

  return { data, error, isLoading, refetch };
}
