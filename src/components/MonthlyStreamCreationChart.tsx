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
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { MonthlyStreamCreation } from "@/lib/services/graphql";
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

export function MonthlyStreamCreationChart() {
  const { data, loading, error } = useAnalytics();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<MonthlyStreamCreation[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have monthlyStreamCreation, fetch directly
  useEffect(() => {
    if (
      !loading &&
      data &&
      !data.monthlyStreamCreation &&
      fallbackData.length === 0 &&
      !fallbackLoading
    ) {
      setFallbackLoading(true);
      // Use direct GraphQL function for faster response
      fetch("/api/fallback-monthly-streams")
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setFallbackData(result.data);
            console.log(`Monthly stream data loaded via fallback: ${result.data.length} months`);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch fallback monthly stream data:", err);
          // In case of error, set empty array to prevent infinite loading
          setFallbackData([]);
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData.length, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const monthlyStreamData = data?.monthlyStreamCreation || fallbackData;

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading monthly stream creation data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (monthlyStreamData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">
          No monthly stream creation data available
        </p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.1)",
        borderColor: "rgb(255, 80, 1)",
        borderWidth: 3,
        data: monthlyStreamData.map((item) => item.count),
        fill: true,
        label: "Streams Created",
        pointBackgroundColor: "rgb(255, 80, 1)",
        pointBorderColor: "rgb(255, 80, 1)",
        pointHoverBackgroundColor: "rgb(255, 80, 1)",
        pointHoverBorderColor: "rgb(255, 255, 255)",
        pointHoverBorderWidth: 3,
        pointHoverRadius: 8,
        pointRadius: 6,
        tension: 0.4,
      },
    ],
    labels: monthlyStreamData.map((item) => {
      const [year, month] = item.month.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }),
  };

  const options = {
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
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${value} streams created`;
          },
          title: (context: any) => {
            const monthIndex = context[0].dataIndex;
            const [year, month] = monthlyStreamData[monthIndex].month.split("-");
            return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
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
          maxRotation: 0,
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
          lineWidth: 1,
        },
        ticks: {
          callback: (tickValue: any) => {
            const value = Number(tickValue);
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            }
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
              Monthly Stream Creation Trends
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={845}
              tooltip="View fetchMonthlyStreamCreation source"
            />
          </div>
          <SharePanel
            title="Monthly Stream Creation Trends"
            elementRef={containerRef}
            description="Number of new vesting streams created each month over the past year"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Streams created per month over the past 12 months
        </p>
        <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <span>12-month period</span>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
