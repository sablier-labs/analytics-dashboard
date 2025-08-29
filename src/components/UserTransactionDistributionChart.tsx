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
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import type { UserTransactionDistribution } from "@/lib/services/graphql";
import { fetchUserTransactionDistribution } from "@/lib/services/graphql";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function UserTransactionDistributionChart() {
  const [distributionData, setDistributionData] = useState<UserTransactionDistribution[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDistributionData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserTransactionDistribution();
        setDistributionData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user transaction distribution",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDistributionData();
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
        <p className="text-sm text-red-600 mb-2">Error loading user transaction distribution</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!distributionData || distributionData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">No user transaction distribution data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderColor: "rgb(168, 85, 247)",
        borderRadius: 4,
        borderSkipped: false,
        borderWidth: 1,
        data: distributionData.map((item) => item.userCount),
        label: "Number of Users",
      },
    ],
    labels: distributionData.map((item) => `${item.label} transactions`),
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyColor: "rgb(255, 255, 255)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${value} users`;
          },
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            return `Users with ${distributionData[dataIndex].label} transactions`;
          },
        },
        cornerRadius: 8,
        displayColors: false,
        titleColor: "rgb(255, 255, 255)",
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
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "rgba(229, 231, 235, 0.8)",
          drawBorder: false,
        },
        ticks: {
          callback: (tickValue: any) => {
            const value = Number(tickValue);
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "k";
            }
            return new Intl.NumberFormat().format(value);
          },
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">User Transaction Distribution</h2>
        <p className="text-sm text-gray-600">How many transactions each user has made</p>
      </div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
