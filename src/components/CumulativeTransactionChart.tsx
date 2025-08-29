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
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import type { MonthlyTransactionGrowth } from "@/lib/services/graphql";
import { fetchMonthlyTransactionGrowth } from "@/lib/services/graphql";

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
  const [transactionData, setTransactionData] = useState<MonthlyTransactionGrowth[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactionData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMonthlyTransactionGrowth();
        setTransactionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transaction growth data");
      } finally {
        setLoading(false);
      }
    }

    loadTransactionData();
  }, []);

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
        <p className="text-sm text-red-600 mb-2">Error loading transaction growth chart</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!transactionData || transactionData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No transaction growth data available</p>
      </div>
    );
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 3,
        data: transactionData.map((item) => item.cumulativeTransactions),
        fill: true,
        label: "Cumulative Transactions",
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
        tension: 0.1,
      },
      {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        data: transactionData.map((item) => item.newTransactions),
        fill: false,
        label: "New Transactions",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointRadius: 3,
        tension: 0.1,
      },
    ],
    labels: transactionData.map((item) => formatMonth(item.month)),
  };

  const options = {
    interaction: {
      axis: "x" as const,
      intersect: false,
      mode: "nearest" as const,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyColor: "rgb(255, 255, 255)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
        titleColor: "rgb(255, 255, 255)",
      },
    },
    responsive: true,
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxTicksLimit: 12,
        },
        title: {
          display: true,
          font: {
            size: 12,
          },
          text: "Month",
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: (value: any) => {
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + "M";
            } else if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + "k";
            }
            return new Intl.NumberFormat().format(numValue);
          },
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          font: {
            size: 12,
          },
          text: "Number of Transactions",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cumulative Transaction Growth</h2>
        <p className="text-sm text-gray-600">
          Monthly transaction growth and cumulative transaction volume since inception
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
