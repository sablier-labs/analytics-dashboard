"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchMonthlyUserGrowth, type MonthlyUserGrowth } from "@/lib/services/graphql";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function CumulativeUserChart() {
  const [userGrowthData, setUserGrowthData] = useState<MonthlyUserGrowth[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserGrowthData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMonthlyUserGrowth();
        setUserGrowthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user growth data');
      } finally {
        setLoading(false);
      }
    }

    loadUserGrowthData();
  }, []);

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
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
    labels: userGrowthData.map(data => formatMonth(data.month)),
    datasets: [
      {
        label: 'Cumulative Users',
        data: userGrowthData.map(data => data.cumulativeUsers),
        borderColor: 'rgb(226, 92, 49)',
        backgroundColor: 'rgba(226, 92, 49, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: 'rgb(226, 92, 49)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'New Users',
        data: userGrowthData.map(data => data.newUsers),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Users',
          font: {
            size: 12,
          },
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat().format(value);
          },
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cumulative User Growth</h2>
        <p className="text-sm text-gray-600">Monthly user acquisition and cumulative growth since inception</p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}