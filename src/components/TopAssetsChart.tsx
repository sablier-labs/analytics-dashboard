"use client";

import { useRef } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { TopAsset } from "@/lib/services/graphql";
import { useState, useEffect } from "react";
import { SourceCodeLink } from "./SourceCodeLink";
import { useTheme } from "@/contexts/ThemeContext";
import { SharePanel } from "./SharePanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function TopAssetsChart() {
  const { data, loading, error } = useAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<TopAsset[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have topAssets, fetch directly
  useEffect(() => {
    if (!loading && data && !data.topAssets && fallbackData.length === 0 && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/test-assets')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
          }
        })
        .catch(err => console.error('Failed to fetch fallback data:', err))
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData.length, fallbackLoading]);

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading top assets</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Use cached data if available, otherwise use fallback data
  const topAssets = data?.topAssets || fallbackData;

  console.log("TopAssetsChart data:", { 
    data: !!data, 
    cachedAssets: data?.topAssets?.length || 0, 
    fallbackAssets: fallbackData.length,
    totalAssets: topAssets.length 
  });

  if (topAssets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No top assets data available</p>
        {data && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Debug: Data loaded but topAssets is empty. Available keys: {Object.keys(data).join(', ')}
          </p>
        )}
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
        data: topAssets.map((asset) => asset.streamCount),
        label: "Stream Count",
      },
    ],
    labels: topAssets.map((asset) => asset.symbol),
  };

  const options = {
    indexAxis: "y" as const,
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
          afterLabel: (context: any) => {
            const asset = topAssets[context.dataIndex];
            return `${asset.name} (Chain ${asset.chainId})`;
          },
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.x);
            return `${value} streams`;
          },
          title: (context: any) => {
            const asset = topAssets[context[0].dataIndex];
            return `${asset.symbol} - ${asset.name}`;
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
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          callback: (tickValue: any) => {
            const value = Number(tickValue);
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "k";
            }
            return new Intl.NumberFormat().format(value);
          },
          color: theme === "dark" ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          maxTicksLimit: 6,
          padding: 12,
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: theme === "dark" ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          padding: 8,
        },
      },
    },
  };

  const totalStreams = topAssets.reduce((sum, asset) => sum + asset.streamCount, 0);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Assets by Stream Count</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={752} tooltip="View fetchTopAssetsByStreamCount source" />
          </div>
          <SharePanel 
            title="Top Assets by Stream Count"
            elementRef={containerRef}
            description="Most popular ERC-20 tokens being used for streaming, ranked by total number of streams"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Most popular ERC-20 tokens being used for streaming
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Total streams: {new Intl.NumberFormat().format(totalStreams)}</span>
          <span>Top {topAssets.length} assets shown</span>
        </div>
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}