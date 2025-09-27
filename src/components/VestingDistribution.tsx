"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(ArcElement, Tooltip, Legend);

export function VestingDistribution() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const vestingData = data?.vestingDistribution || null;

  if (isLoading) {
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
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading vesting distribution data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!vestingData || (vestingData.instant === 0 && vestingData.vesting === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No vesting distribution data available</p>
      </div>
    );
  }

  const total = vestingData.instant + vestingData.vesting;

  const chartData = {
    datasets: [
      {
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue for instant
          "rgba(249, 115, 22, 0.8)", // Orange for vesting
        ],
        borderColor: [
          "rgb(59, 130, 246)", // Blue border
          "rgb(249, 115, 22)", // Orange border
        ],
        borderWidth: 2,
        cutout: "60%", // This creates the donut effect
        data: [vestingData.instant, vestingData.vesting],
        hoverBackgroundColor: ["rgba(59, 130, 246, 0.9)", "rgba(249, 115, 22, 0.9)"],
      },
    ],
    labels: ["Instant", "Vesting"],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create custom legend below
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
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat().format(value);
            return `${context.label}: ${formattedValue} campaigns (${percentage}%)`;
          },
        },
        cornerRadius: 6,
        displayColors: true,
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Vesting Distribution
            </h2>
            <SourceCodeLink
              fileName="airdrops-graphql.ts"
              lineNumber={407}
              tooltip="View fetchVestingDistribution source"
            />
          </div>
          <SharePanel
            title="Vesting Distribution"
            elementRef={containerRef}
            description="Distribution of campaigns by type: instant vs vesting unlock"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Distribution of campaigns by type: instant vs vesting unlock
        </p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative h-64 w-64">
          <Doughnut data={chartData} options={options} />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(total)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Campaigns</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Instant Campaigns */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "rgb(59, 130, 246)" }}
            ></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Instant</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatNumber(vestingData.instant)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((vestingData.instant / total) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Vesting Campaigns */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "rgb(249, 115, 22)" }}
            ></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Vesting</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {formatNumber(vestingData.vesting)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((vestingData.vesting / total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
