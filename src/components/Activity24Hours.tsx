"use client";

import { BarChart3, Clock, Gift, Plus, Zap } from "lucide-react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { Activity24Hours as Activity24HoursMetrics } from "@/lib/services/graphql";

interface Activity24HoursData {
  activity24Hours?: Activity24HoursMetrics;
}

export function Activity24Hours() {
  const { data, loading } = useAnalyticsContext() as {
    data: Activity24HoursData | null;
    loading: boolean;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={`loading-${i}`}
            className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
          >
            <div className="animate-pulse">
              <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activity = data?.activity24Hours;

  if (!activity) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
          <div className="text-center text-text-secondary">No 24-hour activity data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Vesting Streams Created (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Vesting Streams Created (24h)</p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.streamsCreated ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 text-text-muted mr-1" />
            <span className="text-text-secondary">New vesting streams in the last 24 hours</span>
          </div>
        </div>
      </div>

      {/* Total Transactions (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Transactions (24h)</p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.totalTransactions ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <Zap className="w-4 h-4 text-text-muted mr-1" />
            <span className="text-text-secondary">All interactions across Sablier protocols</span>
          </div>
        </div>
      </div>

      {/* Airdrop Claims (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Airdrop Claims (24h)</p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.claimsCreated ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <Gift className="w-4 h-4 text-text-muted mr-1" />
            <span className="text-text-secondary">Airdrop claims in the last 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
