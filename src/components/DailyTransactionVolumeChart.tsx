"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { DailyTransactionVolume } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function DailyTransactionVolumeChart() {
  const { data, loading, error } = useAnalytics();
  const [period, setPeriod] = useState<30 | 90>(30);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger cache update
      const response = await fetch("/api/update-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Reload the page to get fresh data
        window.location.reload();
      } else {
        console.error("Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Filter data based on selected period using actual dates
  const availableData = data?.dailyTransactionVolume || [];
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
  
  // Sort all available data by date (newest first for processing)
  const sortedData = availableData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // First, try to get data from the requested date range (last N days from today)
  let volumeData = sortedData
    .filter(item => new Date(item.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let isShowingStaleData = false;
  let actualDateRange = { start: "", end: "" };
  
  // If no data in the requested range, show the last N days from available data
  if (volumeData.length === 0 && sortedData.length > 0) {
    // Instead of taking the most recent N items, take the actual last N days
    // from the available date range
    const newestDate = new Date(sortedData[0].date);
    const oldestNeededDate = new Date(newestDate.getTime() - (period - 1) * 24 * 60 * 60 * 1000);
    
    volumeData = sortedData
      .filter(item => new Date(item.date) >= oldestNeededDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    isShowingStaleData = true;
  }
  
  // Calculate actual date range being shown
  if (volumeData.length > 0) {
    actualDateRange.start = volumeData[0].date;
    actualDateRange.end = volumeData[volumeData.length - 1].date;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading transaction volume chart</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!volumeData || volumeData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No transaction volume data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.8)",
        borderColor: "rgb(255, 80, 1)",
        borderRadius: 4,
        borderSkipped: false,
        borderWidth: 1,
        data: volumeData.map((item) => item.count),
        label: "Daily Transactions",
      },
    ],
    labels: volumeData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    }),
  };

  const options = {
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        bodyColor: "rgb(255, 255, 255)",
        borderWidth: 0,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${value} transactions`;
          },
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            const date = new Date(volumeData[dataIndex].date);
            return date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          },
        },
        cornerRadius: 6,
        displayColors: false,
        padding: 12,
        titleColor: "rgb(255, 255, 255)",
        titleFont: {
          size: 13,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          maxTicksLimit: period === 30 ? 8 : 12,
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
          lineWidth: 1,
        },
        position: "left" as const,
        ticks: {
          callback: (tickValue: any) => {
            const value = Number(tickValue);
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "k";
            }
            return new Intl.NumberFormat().format(value);
          },
          color: "rgb(107, 114, 128)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          maxTicksLimit: 6,
          padding: 12,
        },
      },
    },
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Transaction Volume</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={690} tooltip="View fetchDailyTransactionVolume source" />
          </div>
          <SharePanel 
            title="Daily Transaction Volume"
            elementRef={containerRef}
            description="Number of transactions processed each day across different time periods"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>Number of transactions processed each day</p>
            {volumeData && actualDateRange.start && (
              <p className="mt-1">
                <span className="font-medium">
                  Showing: {new Date(actualDateRange.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(actualDateRange.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {isShowingStaleData && (
                  <span className="text-orange-600 dark:text-orange-400 ml-2">
                    (Most recent available data - cache needs update)
                  </span>
                )}
                {!isShowingStaleData && volumeData.length < period && (
                  <span className="text-orange-600 dark:text-orange-400 ml-2">
                    ({volumeData.length} of {period} requested days)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isShowingStaleData && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-1 text-sm font-medium text-sablier-600 dark:text-sablier-400 hover:bg-sablier-50 dark:hover:bg-sablier-900 rounded-md border border-sablier-200 dark:border-sablier-700 transition-colors disabled:opacity-50"
                title="Refresh to get latest data"
              >
                {refreshing ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </span>
                ) : (
                  "Refresh Data"
                )}
              </button>
            )}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setPeriod(30)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                period === 30 ? "bg-sablier-100 text-sablier-700 dark:bg-sablier-900 dark:text-sablier-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              30 days
            </button>
            <button
              type="button"
              onClick={() => setPeriod(90)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                period === 90 ? "bg-sablier-100 text-sablier-700 dark:bg-sablier-900 dark:text-sablier-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              90 days
            </button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
