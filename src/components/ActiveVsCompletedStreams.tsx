"use client";

import { useRef, useState, useEffect } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTheme } from "@/contexts/ThemeContext";
import type { ActiveVsCompletedStreams as ActiveVsCompletedStreamsType } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

ChartJS.register(ArcElement, Tooltip, Legend);

export function ActiveVsCompletedStreams() {
  const { data, loading, error } = useAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<ActiveVsCompletedStreamsType | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have activeVsCompletedStreams, fetch directly
  useEffect(() => {
    if (!loading && data && !data.activeVsCompletedStreams && !fallbackData && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/test-active-completed')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log(`Active vs completed streams loaded via fallback: ${result.data.active} active, ${result.data.completed} completed`);
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback active vs completed streams:', err);
          // In case of error, set a default object to prevent infinite loading
          setFallbackData({ active: 0, completed: 0, total: 0 });
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const streamsData = data?.activeVsCompletedStreams || fallbackData;

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading active vs completed streams</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!streamsData || streamsData.total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No active vs completed streams data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ["Active", "Completed"],
    datasets: [
      {
        data: [streamsData.active, streamsData.completed],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",    // Green for Active
          "rgba(107, 114, 128, 0.8)",  // Gray for Completed
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(107, 114, 128)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(34, 197, 94, 0.9)",
          "rgba(107, 114, 128, 0.9)",
        ],
        cutout: "60%", // This creates the donut effect
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create custom legend below
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "rgb(255, 255, 255)",
        bodyColor: "rgb(255, 255, 255)",
        borderWidth: 0,
        cornerRadius: 6,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / streamsData.total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat().format(value);
            return `${context.label}: ${formattedValue} (${percentage}%)`;
          },
        },
        titleFont: {
          size: 13,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active vs Completed Streams</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={1268} tooltip="View fetchActiveVsCompletedStreams source" />
          </div>
          <SharePanel 
            title="Active vs Completed Streams"
            elementRef={containerRef}
            description="Current status of all vesting streams on the protocol"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Current vesting status across all streams
        </p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative h-64 w-64">
          <Doughnut data={chartData} options={options} />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(streamsData.total)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Streams
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Streams */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatNumber(streamsData.active)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((streamsData.active / streamsData.total) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Completed Streams */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
            {formatNumber(streamsData.completed)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((streamsData.completed / streamsData.total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}