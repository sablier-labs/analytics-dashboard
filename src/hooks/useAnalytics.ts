import { useEffect, useState } from "react";
import type { CachedAnalyticsData } from "@/lib/services/cache";

export function useAnalytics() {
  const [data, setData] = useState<CachedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, []);

  return { data, error, loading };
}
