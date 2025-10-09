"use client";

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
          <div key={`loading-${i}`} className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
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
        <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
          <div className="text-center text-text-secondary">
            No 24-hour activity data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Vesting Streams Created (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Vesting Streams Created (24h)
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.streamsCreated ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 text-gray-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-text-secondary">
              New vesting streams in the last 24 hours
            </span>
          </div>
        </div>
      </div>

      {/* Total Transactions (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Total Transactions (24h)
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.totalTransactions ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 text-gray-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-text-secondary">
              All interactions across Sablier protocols
            </span>
          </div>
        </div>
      </div>

      {/* Airdrop Claims (24h) */}
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Airdrop Claims (24h)
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {(activity.claimsCreated ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 text-gray-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <span className="text-text-secondary">
              Airdrop claims in the last 24 hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
