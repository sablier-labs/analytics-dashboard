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
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { MonthlyUserGrowth } from "@/lib/services/graphql";
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

export function CumulativeUserChart() {
  const { data, loading, error } = useAnalyticsContext();
  const [fallbackData, setFallbackData] = useState<MonthlyUserGrowth[] | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have monthlyUserGrowth, fetch directly
  useEffect(() => {
    if (
      !loading &&
      data &&
      (!data.monthlyUserGrowth || data.monthlyUserGrowth.length === 0) &&
      !fallbackData &&
      !fallbackLoading
    ) {
      setFallbackLoading(true);
      fetch("/api/fallback-monthly-users")
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setFallbackData(result.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch fallback monthly user growth:", err);
          setFallbackData([]);
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use fallback data if available, otherwise use cached data (prefer real data over empty arrays)
  const hasValidCachedData = data?.monthlyUserGrowth && data.monthlyUserGrowth.length > 0;
  const userGrowthData = fallbackData || (hasValidCachedData ? data.monthlyUserGrowth : null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading user growth data</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!userGrowthData || userGrowthData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No user growth data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.1)",
        borderColor: "rgb(255, 80, 1)",
        borderWidth: 2,
        data: userGrowthData.map((data) => data.cumulativeUsers),
        fill: true,
        label: "Cumulative Users",
        pointBackgroundColor: "rgb(255, 80, 1)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "rgb(255, 80, 1)",
        pointHoverRadius: 6,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
    labels: userGrowthData.map((data) => formatMonth(data.month)),
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
            return `${value} users`;
          },
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            return userGrowthData[dataIndex].month;
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
          color: "rgb(107, 114, 128)",
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
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false,
        },
        ticks: {
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
          color: "rgb(107, 114, 128)",
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
              Cumulative User Growth
            </h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={381}
              tooltip="View fetchMonthlyUserGrowth source"
            />
          </div>
          <SharePanel
            title="Cumulative User Growth"
            elementRef={containerRef}
            description="Monthly user acquisition and cumulative growth since inception"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Monthly user acquisition and cumulative growth since inception
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
