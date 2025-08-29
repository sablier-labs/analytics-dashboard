"use client";

import { useEffect, useState } from "react";
import type { TimeBasedUserCounts } from "@/lib/services/graphql";
import { fetchTimeBasedUserCounts } from "@/lib/services/graphql";

export function TimeBasedUserCounters() {
  const [userCounts, setUserCounts] = useState<TimeBasedUserCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserCounts() {
      try {
        setLoading(true);
        setError(null);
        const counts = await fetchTimeBasedUserCounts();
        setUserCounts(counts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user counts");
      } finally {
        setLoading(false);
      }
    }

    loadUserCounts();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const timeRanges = [
    {
      color: "bg-green-100 text-green-600",
      key: "past30Days" as keyof TimeBasedUserCounts,
      label: "Past 30 Days",
    },
    {
      color: "bg-blue-100 text-blue-600",
      key: "past90Days" as keyof TimeBasedUserCounts,
      label: "Past 90 Days",
    },
    {
      color: "bg-purple-100 text-purple-600",
      key: "past180Days" as keyof TimeBasedUserCounts,
      label: "Past 180 Days",
    },
    {
      color: "bg-orange-100 text-orange-600",
      key: "pastYear" as keyof TimeBasedUserCounts,
      label: "Past Year",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div key={range.key} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading time-based user counts</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Users by Time Period</h2>
        <p className="text-gray-600">Users who have made transactions within each time range</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeRanges.map((range) => (
          <div key={range.key} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{range.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userCounts ? formatNumber(userCounts[range.key]) : "—"}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 ${range.color} rounded-lg`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {userCounts && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Active users
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
