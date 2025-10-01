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
import { useSolanaAnalytics } from "@/hooks/useSolanaAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SolanaTopSPLTokens() {
  const { data, isLoading, error } = useSolanaAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
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
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading top SPL tokens</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  const topSPLTokens = data?.topSPLTokens || [];

  if (topSPLTokens.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No SPL token data available</p>
      </div>
    );
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.8)",
        borderColor: "rgb(255, 80, 1)",
        borderRadius: 4,
        borderSkipped: false,
        borderWidth: 1,
        data: topSPLTokens.map((token) => token.streamCount),
        label: "Stream Count",
      },
    ],
    labels: topSPLTokens.map((token) => truncateAddress(token.mint)),
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
            const token = topSPLTokens[context.dataIndex];
            return `Address: ${token.address}`;
          },
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.x);
            return `${value} streams`;
          },
          title: (context: any) => {
            const token = topSPLTokens[context[0].dataIndex];
            return truncateAddress(token.mint);
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
          color: theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)",
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

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top SPL Tokens by Stream Count
            </h2>
            <SourceCodeLink
              fileName="solana-graphql.ts"
              lineNumber={1}
              tooltip="View fetchSolanaTopSPLTokens source"
            />
          </div>
          <SharePanel
            title="Top SPL Tokens by Stream Count"
            elementRef={containerRef}
            description="Most popular SPL tokens being used for streaming on Solana"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Most popular SPL tokens being used for streaming on Solana
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Top {topSPLTokens.length} tokens shown</span>
        </div>
      </div>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
