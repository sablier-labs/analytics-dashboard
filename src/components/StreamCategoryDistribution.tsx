"use client";

import { useRef, useState, useEffect } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTheme } from "@/contexts/ThemeContext";
import type { StreamCategoryDistribution as StreamCategoryDistributionType } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

ChartJS.register(ArcElement, Tooltip, Legend);

export function StreamCategoryDistribution() {
  const { data, loading, error } = useAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<StreamCategoryDistributionType | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have streamCategoryDistribution, fetch directly
  useEffect(() => {
    if (!loading && data && !data.streamCategoryDistribution && !fallbackData && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/test-category-distribution')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log(`Stream category distribution loaded via fallback: ${result.data.total} total streams`);
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback category distribution:', err);
          // In case of error, set a default object to prevent infinite loading
          setFallbackData({ linear: 0, dynamic: 0, tranched: 0, total: 0 });
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const categoryData = data?.streamCategoryDistribution || fallbackData;

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading stream category distribution</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!categoryData || categoryData.total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No stream category data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ["LockupLinear", "LockupDynamic", "LockupTranched"],
    datasets: [
      {
        data: [categoryData.linear, categoryData.dynamic, categoryData.tranched],
        backgroundColor: [
          "rgba(255, 80, 1, 0.8)",     // Primary brand orange for Linear
          "rgba(154, 52, 18, 0.8)",    // Sablier-800 (dark brown) for Dynamic  
          "rgba(253, 186, 116, 0.8)",  // Sablier-300 (light orange) for Tranched
        ],
        borderColor: [
          "rgb(255, 80, 1)",           // sablier-500
          "rgb(154, 52, 18)",          // sablier-800
          "rgb(253, 186, 116)",        // sablier-300
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(255, 80, 1, 0.9)",
          "rgba(154, 52, 18, 0.9)",
          "rgba(253, 186, 116, 0.9)",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: theme === "dark" ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
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
            const percentage = ((value / categoryData.total) * 100).toFixed(1);
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

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stream Category Distribution</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={1150} tooltip="View fetchStreamCategoryDistribution source" />
          </div>
          <SharePanel 
            title="Stream Category Distribution"
            elementRef={containerRef}
            description="Distribution of vesting stream types across the protocol"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Breakdown of vesting stream categories
        </p>
      </div>

      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {((categoryData.linear / categoryData.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Linear</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {((categoryData.dynamic / categoryData.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Dynamic</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {((categoryData.tranched / categoryData.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Tranched</div>
        </div>
      </div>
    </div>
  );
}