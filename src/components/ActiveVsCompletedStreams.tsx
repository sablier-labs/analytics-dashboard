"use client";

import type { TooltipItem } from "chart.js";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { memo, useMemo, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { ActiveVsCompletedStreams as ActiveVsCompletedStreamsType } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(ArcElement, Tooltip, Legend);

export const ActiveVsCompletedStreams = memo(function ActiveVsCompletedStreams() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use cached data if available, otherwise use fallback data
  const streamsData = data?.activeVsCompletedStreams || null;

  const chartData = useMemo(() => {
    if (!streamsData) {
      return {
        datasets: [],
        labels: [],
      };
    }

    return {
      datasets: [
        {
          backgroundColor: [
            "rgba(255, 80, 1, 0.8)", // Primary brand orange for Active
            "rgba(124, 45, 18, 0.8)", // Sablier-900 (dark brown) for Completed
          ],
          borderColor: [
            "rgb(255, 80, 1)", // sablier-500
            "rgb(124, 45, 18)", // sablier-900
          ],
          borderWidth: 2,
          cutout: "60%", // This creates the donut effect
          data: [streamsData.active, streamsData.completed],
          hoverBackgroundColor: ["rgba(255, 80, 1, 0.9)", "rgba(124, 45, 18, 0.9)"],
        },
      ],
      labels: ["Active", "Completed"],
    };
  }, [streamsData]);

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
            label: (context: TooltipItem<"doughnut">) => {
              if (!streamsData) return "";
              const value = context.parsed;
              const percentage = ((value / streamsData.total) * 100).toFixed(1);
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
    }),
    [streamsData],
  );

  if (loading) {
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
          Error loading active vs completed streams
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!streamsData || streamsData.total === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No active vs completed streams data available</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Active vs Completed Vesting Streams
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={1268}
              tooltip="View fetchActiveVsCompletedStreams source"
            />
          </div>
          <SharePanel
            title="Active vs Completed Vesting Streams"
            elementRef={containerRef}
            description="Current status of all vesting streams on the protocol"
          />
        </div>
        <p className="text-sm text-text-secondary">Current vesting status across all streams</p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative h-64 w-64">
          <Doughnut data={chartData} options={options} />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(streamsData.total)}
              </div>
              <div className="text-sm text-text-tertiary">Total Streams</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Streams */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "rgb(255, 80, 1)" }}
            ></div>
            <span className="text-sm font-medium text-text-secondary">Active</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {formatNumber(streamsData.active)}
          </div>
          <div className="text-sm text-text-tertiary">
            {((streamsData.active / streamsData.total) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Completed Streams */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "rgb(124, 45, 18)" }}
            ></div>
            <span className="text-sm font-medium text-text-secondary">Completed</span>
          </div>
          <div className="text-2xl font-bold text-text-secondary mb-1">
            {formatNumber(streamsData.completed)}
          </div>
          <div className="text-sm text-text-tertiary">
            {((streamsData.completed / streamsData.total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
});
