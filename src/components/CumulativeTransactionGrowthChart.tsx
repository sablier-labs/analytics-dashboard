"use client";

import type { TooltipItem } from "chart.js";
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
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { MonthlyTransactionGrowth } from "@/lib/services/graphql";
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

export const CumulativeTransactionGrowthChart = memo(function CumulativeTransactionGrowthChart() {
  const { data, loading, error } = useAnalyticsContext();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const transactionGrowthData = data?.monthlyTransactionGrowth || null;

  const formatMonth = useMemo(() => {
    return (monthString: string) => {
      const [year, month] = monthString.split("-");
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    };
  }, []);

  const chartData = useMemo(() => {
    if (!transactionGrowthData) return { datasets: [], labels: [] };

    return {
      datasets: [
        {
          backgroundColor: theme === "dark" ? "rgba(255, 165, 0, 0.1)" : "rgba(255, 80, 1, 0.1)",
          borderColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
          borderWidth: 2,
          data: transactionGrowthData.map((data) => data.cumulativeTransactions),
          fill: true,
          label: "Cumulative Transactions",
          pointBackgroundColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
          pointBorderColor: "rgb(255, 255, 255)",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
          pointHoverRadius: 6,
          pointRadius: 0,
          tension: 0.4,
        },
      ],
      labels: transactionGrowthData.map((data) => formatMonth(data.month)),
    };
  }, [transactionGrowthData, theme, formatMonth]);

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
            label: (context: TooltipItem<"line">) => {
              const value = new Intl.NumberFormat().format(context.parsed.y);
              return `${value} transactions`;
            },
            title: (context: TooltipItem<"line">[]) => {
              const dataIndex = context[0].dataIndex;
              return transactionGrowthData[dataIndex].month;
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
            color: theme === "dark" ? "rgba(75, 85, 99, 0.5)" : "rgba(229, 231, 235, 0.5)",
            drawBorder: false,
          },
          ticks: {
            callback: (value: string | number) => {
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
    [theme, transactionGrowthData],
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary rounded w-48 mb-4"></div>
          <div className="h-64 bg-bg-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-200 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 mb-2">Error loading transaction growth data</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!transactionGrowthData || transactionGrowthData.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No transaction growth data available</p>
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
            <h2 className="text-2xl font-bold text-text-primary">Cumulative Transaction Growth</h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={607}
              tooltip="View fetchMonthlyTransactionGrowth source"
            />
          </div>
          <SharePanel
            title="Cumulative Transaction Growth"
            elementRef={containerRef}
            description="Total transactions across all Sablier protocols over time"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Total transactions across all Sablier protocols over time
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});
