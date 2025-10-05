"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CachedAnalyticsData } from "@/lib/services/cache";

interface AnalyticsContextType {
  data: CachedAnalyticsData | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CachedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const refetch = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  return (
    <AnalyticsContext.Provider value={{ data, error, loading, refetch }}>
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
