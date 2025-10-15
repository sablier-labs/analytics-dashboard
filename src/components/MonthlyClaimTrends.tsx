"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { memo, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const MonthlyClaimTrends = memo(function MonthlyClaimTrends() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const claimData = data?.monthlyClaimTrends || null;
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="h-64 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading monthly claim trends data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!claimData || claimData.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No monthly claim trends data available</p>
      </div>
    );
  }

  const chartData = useMemo(() => {
    if (!claimData) return { datasets: [], labels: [] };

    return {
      datasets: [
        {
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 2,
          data: claimData.map((data) => data.count),
          fill: true,
          label: "Claims",
          pointBackgroundColor: "rgb(16, 185, 129)",
          pointBorderColor: "rgb(255, 255, 255)",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "rgb(16, 185, 129)",
          pointHoverRadius: 6,
          pointRadius: 0,
          tension: 0.4,
        },
      ],
      labels: claimData.map((data) => formatMonth(data.month)),
    };
  }, [claimData]);

  const options = useMemo(
    () => ({
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
            // biome-ignore lint/suspicious/noExplicitAny: Chart.js callback types
            label: (context: any) => {
              const value = new Intl.NumberFormat().format(context.parsed.y);
              return `${value} claims`;
            },
            // biome-ignore lint/suspicious/noExplicitAny: Chart.js callback types
            title: (context: any) => {
              const dataIndex = context[0].dataIndex;
              return claimData[dataIndex].month;
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
            maxTicksLimit: 8,
            padding: 8,
          },
        },
        y: {
          beginAtZero: true,
          border: {
            display: false,
          },
          grid: {
            color: theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)",
            drawBorder: false,
          },
          ticks: {
            // biome-ignore lint/suspicious/noExplicitAny: Chart.js tick callback types
            callback: (value: any) => {
              const num = Number(value);
              if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + "M";
              }
              if (num >= 1000) {
                return (num / 1000).toFixed(0) + "k";
              }
              return new Intl.NumberFormat().format(num);
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
      },
    }),
    [theme, claimData],
  );

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Monthly Airdrop Claim Trends</h2>
            <SourceCodeLink
              fileName="airdrops-graphql.ts"
              lineNumber={582}
              tooltip="View fetchMonthlyClaimTrends source"
            />
          </div>
          <SharePanel
            title="Monthly Airdrop Claim Trends"
            elementRef={containerRef}
            description="Number of claims per month across all airdrop campaigns"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Number of claims per month across all airdrop campaigns
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});
