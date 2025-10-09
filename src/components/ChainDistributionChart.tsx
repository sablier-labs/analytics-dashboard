"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useRef } from "react";
import { Pie } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { getMainnetChainName, isTestnetChain } from "@/lib/constants/chains";
import type { ChainDistribution } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate brand-based colors for pie chart
function generateChainColors(chainData: ChainDistribution[]): string[] {
  const brandColors = [
    "#FF5001", // Primary brand orange
    "#ea580c", // Orange 600
    "#fb923c", // Orange 400
    "#fdba74", // Orange 300
    "#fed7aa", // Orange 200
    "#c2410c", // Orange 700
    "#9a3412", // Orange 800
    "#f97316", // Orange 500 variant
    "#ff6b35", // Orange variant
    "#ff8566", // Orange tint
    "#ff9f80", // Orange light
    "#ffb399", // Orange lighter
    "#ffc7b3", // Orange lightest
    "#e55100", // Deep orange
    "#ff7043", // Orange accent
    "#ff8a65", // Orange light accent
    "#ffab91", // Orange very light
    "#ffccbc", // Orange pale
    "#d84315", // Red orange
    "#ff5722", // Deep orange material
    "#ff6f00", // Amber orange
    "#ff8f00", // Amber
    "#ffa000", // Amber dark
    "#ffb300", // Amber darker
    "#ffc107", // Amber yellow
  ];

  return chainData.map((_, index) => brandColors[index % brandColors.length]);
}

export function ChainDistributionChart() {
  const { data, loading, error } = useAnalyticsContext();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out all testnet chains
  const chainData =
    data?.chainDistribution?.filter((chain) => !isTestnetChain(chain.chainId)) || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-200 dark:border-red-700 shadow-md p-8 transition-colors duration-200">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading chain distribution
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!chainData || chainData.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <p className="text-text-secondary">No chain distribution data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: generateChainColors(chainData),
        borderColor: "transparent",
        borderWidth: 0,
        data: chainData.map((chain) => chain.userCount),
        hoverBackgroundColor: generateChainColors(chainData),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 2,
      },
    ],
    labels: chainData.map((chain) => {
      const chainName = getMainnetChainName(chain.chainId);
      return chainName.charAt(0).toUpperCase() + chainName.slice(1); // Capitalize first letter
    }),
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxHeight: 12,
          boxWidth: 12,
          color: theme === "dark" ? "rgb(255, 255, 255)" : "rgb(55, 65, 81)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            const total = data.datasets[0].data.reduce(
              (sum: number, value: number) => sum + value,
              0,
            );

            return data.labels.slice(0, 10).map((label: string, index: number) => {
              const value = data.datasets[0].data[index];
              const percentage = ((value / total) * 100).toFixed(1);

              return {
                fillStyle: data.datasets[0].backgroundColor[index],
                fontColor: theme === "dark" ? "rgb(255, 255, 255)" : "rgb(55, 65, 81)",
                hidden: false,
                index: index,
                lineWidth: 0,
                pointStyle: "circle",
                strokeStyle: "transparent",
                text: `${label} (${percentage}%)`,
              };
            });
          },
          padding: 16,
          usePointStyle: true,
        },
        position: "right" as const,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        bodyColor: "rgb(255, 255, 255)",
        bodyFont: {
          size: 12,
        },
        borderWidth: 0,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = new Intl.NumberFormat().format(context.parsed);
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} users (${percentage}%)`;
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
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              User Distribution by Chain
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={466}
              tooltip="View fetchChainDistribution source"
            />
          </div>
          <SharePanel
            title="User Distribution by Chain"
            elementRef={containerRef}
            description="Distribution of active users across different blockchain networks"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Distribution of active users across different blockchain networks
        </p>
      </div>
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
