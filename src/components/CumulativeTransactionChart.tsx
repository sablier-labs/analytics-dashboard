"use client";

import { useRef } from "react";
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
import { Line } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { MonthlyTransactionGrowth } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

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

export function CumulativeTransactionChart() {
  const { data, loading, error } = useAnalytics();
  const transactionData = data?.monthlyTransactionGrowth || null;
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) {
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
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading transaction growth chart</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!transactionData || transactionData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No transaction growth data available</p>
      </div>
    );
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(255, 80, 1, 0.1)",
        borderColor: "rgb(255, 80, 1)",
        borderWidth: 2,
        data: transactionData.map((item) => item.cumulativeTransactions),
        fill: true,
        label: "Cumulative Transactions",
        pointBackgroundColor: "rgb(255, 80, 1)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 0,
        pointHoverBackgroundColor: "rgb(255, 80, 1)",
        tension: 0.4,
      },
    ],
    labels: transactionData.map((item) => formatMonth(item.month)),
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
            return transactionData[dataIndex].month;
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cumulative Transaction Growth</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={565} tooltip="View fetchMonthlyTransactionGrowth source" />
          </div>
          <SharePanel 
            title="Cumulative Transaction Growth"
            elementRef={containerRef}
            description="Monthly transaction growth and cumulative transactions since inception"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Monthly transaction growth and cumulative transaction volume since inception
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
