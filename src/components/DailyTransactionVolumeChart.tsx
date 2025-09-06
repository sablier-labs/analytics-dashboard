"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { DailyTransactionVolume } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function DailyTransactionVolumeChart() {
  const { data, loading, error } = useAnalytics();
  const [period, setPeriod] = useState<30 | 90>(30);
  
  // Filter data based on selected period  
  const volumeData = data?.dailyTransactionVolume?.slice(-period) || null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading transaction volume chart</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!volumeData || volumeData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No transaction volume data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.8)",
        borderColor: "rgb(255, 80, 1)",
        borderRadius: 4,
        borderSkipped: false,
        borderWidth: 1,
        data: volumeData.map((item) => item.count),
        label: "Daily Transactions",
      },
    ],
    labels: volumeData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
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
        borderWidth: 0,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${value} transactions`;
          },
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            const date = new Date(volumeData[dataIndex].date);
            return date.toLocaleDateString("en-US", {
              day: "numeric",
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
        bodyFont: {
          size: 12,
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
          maxTicksLimit: period === 30 ? 8 : 12,
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
          lineWidth: 1,
        },
        position: "left" as const,
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Transaction Volume</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={588} tooltip="View fetchDailyTransactionVolume source" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Number of transactions processed each day</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            type="button"
            onClick={() => setPeriod(30)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              period === 30 ? "bg-sablier-100 text-sablier-700 dark:bg-sablier-900 dark:text-sablier-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            30 days
          </button>
          <button
            type="button"
            onClick={() => setPeriod(90)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              period === 90 ? "bg-sablier-100 text-sablier-700 dark:bg-sablier-900 dark:text-sablier-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            90 days
          </button>
        </div>
      </div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
