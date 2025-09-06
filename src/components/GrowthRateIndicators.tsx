"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import type { GrowthRateMetrics } from "@/lib/services/graphql";

export function GrowthRateIndicators() {
  const { data, loading, error } = useAnalytics();
  const growthMetrics = data?.growthRateMetrics || null;

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return (
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      );
    }
    if (value < 0) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 13l-5 5m0 0l-5-5m5 5V6"
          />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading growth metrics</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!growthMetrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No growth metrics available</p>
      </div>
    );
  }

  const metrics = [
    {
      description: "Month-over-month",
      label: "User Growth",
      value: growthMetrics.userGrowthRate,
    },
    {
      description: "Month-over-month",
      label: "Transaction Growth",
      value: growthMetrics.transactionGrowthRate,
    },
    {
      description: "Month-over-month",
      label: "Avg Tx/User Growth",
      value: growthMetrics.averageTransactionGrowthRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold ${getGrowthColor(metric.value)}`}>
                {formatPercentage(metric.value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </div>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                metric.value > 0 ? "bg-green-100" : metric.value < 0 ? "bg-red-100" : "bg-gray-100"
              }`}
            >
              {getGrowthIcon(metric.value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
