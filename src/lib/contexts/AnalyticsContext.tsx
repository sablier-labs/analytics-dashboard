"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AnalyticsData {
  totalUsers: number;
  totalTransactions: number;
  timeBasedUsers: {
    past30Days: number;
    past90Days: number;
    past180Days: number;
    pastYear: number;
  };
  timeBasedTransactions: {
    past30Days: number;
    past90Days: number;
    past180Days: number;
    pastYear: number;
  };
  monthlyUserGrowth: Array<{
    month: string;
    cumulativeUsers: number;
    newUsers: number;
  }>;
  chainDistribution: Array<{
    chainId: string;
    userCount: number;
  }>;
  monthlyTransactionGrowth: Array<{
    month: string;
    cumulativeTransactions: number;
    newTransactions: number;
  }>;
  averageTransactionsPerUser: number;
  dailyTransactionVolume: Array<{
    date: string;
    count: number;
  }>;
  growthRateMetrics: {
    userGrowthRate: number;
    transactionGrowthRate: number;
    averageTransactionGrowthRate: number;
  };
}

interface AnalyticsContextType {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        loading,
        error,
        refetch: fetchAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}