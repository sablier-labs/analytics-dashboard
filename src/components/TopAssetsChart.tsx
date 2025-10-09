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
import { useRef } from "react";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { TopAsset } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function TopAssetsChart() {
  const { data, loading, error } = useAnalyticsContext();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const topAssets = data?.topAssets || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-80 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading top assets</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!topAssets || topAssets.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No top assets data available</p>
        {data && (
          <p className="text-xs text-text-tertiary mt-2">
            Debug: Data loaded but topAssets is empty. Available keys:{" "}
            {Object.keys(data).join(", ")}
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
        bodyFont: {
          size: 12,
        },
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

  const _totalStreams = topAssets.reduce((sum, asset) => sum + asset.streamCount, 0);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Top Assets by Vesting Stream Count
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={752}
              tooltip="View fetchTopAssetsByStreamCount source"
            />
          </div>
          <SharePanel
            title="Top Assets by Vesting Stream Count"
            elementRef={containerRef}
            description="Most popular ERC-20 tokens being used for streaming, ranked by total number of streams"
          />
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Most popular ERC-20 tokens being used for streaming
        </p>
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span>Top {topAssets.length} assets shown</span>
        </div>
      </div>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
