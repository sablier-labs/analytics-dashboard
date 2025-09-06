"use client";

import { useEffect, useState } from "react";

export function AverageTransactionsPerUser() {
  const [averageTransactions, setAverageTransactions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAverageTransactions() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setAverageTransactions(data.averageTransactionsPerUser);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load average transactions per user",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAverageTransactions();
  }, []);

  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading average transactions</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Avg Transactions Per User</p>
          <p className="text-2xl font-bold text-gray-900">
            {averageTransactions !== null ? formatNumber(averageTransactions) : "—"}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
          <svg
            className="w-6 h-6 text-purple-600"
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
    </div>
  );
}
