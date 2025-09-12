import { useEffect, useState } from "react";
import type { CachedAnalyticsData } from "@/lib/services/cache";

export function useAnalytics() {
  const [data, setData] = useState<CachedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      
      // Check if data is stale (more than 2 days old)
      if (analyticsData.dailyTransactionVolume?.length > 0) {
        const lastDataDate = new Date(analyticsData.dailyTransactionVolume[analyticsData.dailyTransactionVolume.length - 1].date);
        const now = new Date();
        const isStale = (now.getTime() - lastDataDate.getTime()) > (2 * 24 * 60 * 60 * 1000);
        
        if (isStale && !isRefreshing) {
          console.log("Data is stale, triggering automatic refresh...");
          await refreshCache();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  async function refreshCache() {
    try {
      setIsRefreshing(true);
      console.log("Refreshing cache...");
      
      const response = await fetch("/api/update-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        console.log("Cache refreshed successfully, reloading data...");
        // Reload the data after cache refresh
        const analyticsResponse = await fetch("/api/analytics");
        if (analyticsResponse.ok) {
          const freshData = await analyticsResponse.json();
          setData(freshData);
        }
      } else {
        console.error("Failed to refresh cache:", await response.text());
      }
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  return { data, error, loading, isRefreshing, refreshCache };
}
