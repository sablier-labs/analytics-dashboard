"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useRef } from "react";
import { Pie } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { StreamCategoryDistribution as StreamCategoryDistributionType } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(ArcElement, Tooltip, Legend);

export function StreamCategoryDistribution() {
  const { data, loading, error } = useAnalyticsContext();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
    
    // Use cached data if available, otherwise use fallback data
  const categoryData = data?.streamCategoryDistribution || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-64 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading stream category distribution
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!categoryData || categoryData.total === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <p className="text-text-secondary">No stream category data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: [
          "rgba(255, 80, 1, 0.8)", // Primary brand orange for Linear
          "rgba(154, 52, 18, 0.8)", // Sablier-800 (dark brown) for Dynamic
          "rgba(253, 186, 116, 0.8)", // Sablier-300 (light orange) for Tranched
        ],
        borderColor: [
          "rgb(255, 80, 1)", // sablier-500
          "rgb(154, 52, 18)", // sablier-800
          "rgb(253, 186, 116)", // sablier-300
        ],
        borderWidth: 2,
        data: [categoryData.linear, categoryData.dynamic, categoryData.tranched],
        hoverBackgroundColor: [
          "rgba(255, 80, 1, 0.9)",
          "rgba(154, 52, 18, 0.9)",
          "rgba(253, 186, 116, 0.9)",
        ],
      },
    ],
    labels: ["LockupLinear", "LockupDynamic", "LockupTranched"],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme === "dark" ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 12,
          },
          padding: 20,
          pointStyle: "circle",
          usePointStyle: true,
        },
        position: "bottom" as const,
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
            const percentage = ((value / categoryData.total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat().format(value);
            return `${context.label}: ${formattedValue} (${percentage}%)`;
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

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Stream Category Distribution
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={1150}
              tooltip="View fetchStreamCategoryDistribution source"
            />
          </div>
          <SharePanel
            title="Stream Category Distribution"
            elementRef={containerRef}
            description="Distribution of vesting stream types across the protocol"
          />
        </div>
        <p className="text-sm text-text-secondary">
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
          <div className="text-sm text-text-secondary">Linear</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {((categoryData.dynamic / categoryData.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-text-secondary">Dynamic</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {((categoryData.tranched / categoryData.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-text-secondary">Tranched</div>
        </div>
      </div>
    </div>
  );
}
