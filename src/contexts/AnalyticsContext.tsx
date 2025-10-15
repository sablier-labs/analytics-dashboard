"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CachedAnalyticsData } from "@/lib/services/cache";
import { CachedAnalyticsDataSchema } from "@/lib/validation/analytics-schema";

interface AnalyticsContextType {
  data: CachedAnalyticsData | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  refetch: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CachedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (bustCache = false) => {
    try {
      // Only set loading=true on initial load, use refreshing=true for refetch
      if (bustCache) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const url = bustCache ? `/api/analytics?t=${Date.now()}` : "/api/analytics";
      console.log(`📊 Fetching analytics${bustCache ? " (cache-busted)" : ""}:`, url);
      const response = await fetch(url, {
        cache: bustCache ? "no-store" : "default",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const rawData = await response.json();

      // Validate data with zod schema
      const validationResult = CachedAnalyticsDataSchema.safeParse(rawData);

      if (!validationResult.success) {
        console.error("❌ Data validation failed:", validationResult.error.format());
        throw new Error(
          `Invalid analytics data structure: ${validationResult.error.issues[0]?.message || "Unknown validation error"}`,
        );
      }

      const analyticsData = validationResult.data;
      console.log(
        "📊 Analytics data loaded and validated, lastUpdated:",
        analyticsData.lastUpdated,
      );
      setData(analyticsData);
    } catch (err) {
      console.error("❌ Failed to load analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const refetch = useCallback(async () => {
    // Add small delay to allow Edge Config to propagate, then bust cache
    await new Promise((resolve) => setTimeout(resolve, 500));
    await loadAnalytics(true);
  }, [loadAnalytics]);

  return (
    <AnalyticsContext.Provider value={{ data, error, loading, refetch, refreshing }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalyticsContext must be used within an AnalyticsProvider");
  }
  return context;
}
