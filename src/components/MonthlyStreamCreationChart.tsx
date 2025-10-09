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
import { useRef } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
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
  const { data, loading, error } = useAnalyticsContext();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const streamData = data?.monthlyStreamCreation || null;

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-200 shadow-md p-8 transition-colors duration-200">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading stream creation chart
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!streamData || streamData.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <p className="text-text-secondary">No stream creation data available</p>
      </div>
    );
  }

  const chartData = {
    labels: streamData.map((item) => formatMonth(item.month)),
    datasets: [
      {
        label: "Streams Created",
        data: streamData.map((item) => item.count),
        borderColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
        backgroundColor: theme === "dark" ? "rgba(255, 165, 0, 0.1)" : "rgba(255, 80, 1, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: theme === "dark" ? "rgb(255, 165, 0)" : "rgb(255, 80, 1)",
      },
    ],
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
            const [year, month] = streamData[monthIndex].month.split("-");
            return new Date(parseInt(year, 10), parseInt(month, 10) - 1).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              },
            );
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
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Monthly Vesting Stream Creation Trends
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={845}
              tooltip="View fetchMonthlyStreamCreation source"
            />
          </div>
          <SharePanel
            title="Monthly Vesting Stream Creation Trends"
            elementRef={containerRef}
            description="Number of new vesting streams created each month over the past year"
          />
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Vesting streams created per month over the past 12 months
        </p>
        <div className="flex items-center gap-6 text-xs text-text-secondary">
          <span>12-month period</span>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
