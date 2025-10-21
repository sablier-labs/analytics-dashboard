"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { memo, useMemo, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(ArcElement, Tooltip, Legend);

export const VestingDistribution = memo(function VestingDistribution() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const vestingData = data?.vestingDistribution || null;
  const total = vestingData ? vestingData.instant + vestingData.vesting : 0;

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
        data: [vestingData?.instant || 0, vestingData?.vesting || 0],
        hoverBackgroundColor: ["rgba(59, 130, 246, 0.9)", "rgba(249, 115, 22, 0.9)"],
      },
    ],
    labels: ["Instant", "Vesting"],
  };

  const options = useMemo(
    () => ({
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
            // biome-ignore lint/suspicious/noExplicitAny: Chart.js callback types
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
    }),
    [total],
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-64 bg-bg-tertiary dark:bg-surface-hover rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            <div className="h-16 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading vesting distribution data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!vestingData || (vestingData.instant === 0 && vestingData.vesting === 0)) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No vesting distribution data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Vesting Distribution</h2>
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
        <p className="text-sm text-text-secondary">
          Distribution of campaigns by type: instant vs vesting unlock
        </p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative h-64 w-64">
          <Doughnut data={chartData} options={options} />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{formatNumber(total)}</div>
              <div className="text-sm text-text-tertiary">Total Campaigns</div>
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
            <span className="text-sm font-medium text-text-secondary">Instant</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatNumber(vestingData.instant)}
          </div>
          <div className="text-sm text-text-tertiary">
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
            <span className="text-sm font-medium text-text-secondary">Vesting</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {formatNumber(vestingData.vesting)}
          </div>
          <div className="text-sm text-text-tertiary">
            {((vestingData.vesting / total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
});
