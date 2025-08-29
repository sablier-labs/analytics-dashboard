"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { fetchDailyTransactionVolume, type DailyTransactionVolume } from "@/lib/services/graphql";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function DailyTransactionVolumeChart() {
  const [volumeData, setVolumeData] = useState<DailyTransactionVolume[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<30 | 90>(30);

  useEffect(() => {
    async function loadVolumeData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDailyTransactionVolume(period);
        setVolumeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction volume data');
      } finally {
        setLoading(false);
      }
    }

    loadVolumeData();
  }, [period]);

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
    labels: volumeData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Transactions',
        data: volumeData.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const date = new Date(volumeData[dataIndex].date);
            return date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          },
          label: function(context: any) {
            const value = new Intl.NumberFormat().format(context.parsed.y);
            return `${value} transactions`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
          maxTicksLimit: period === 30 ? 10 : 15,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.8)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
          callback: function(tickValue: any) {
            const value = Number(tickValue);
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'k';
            }
            return new Intl.NumberFormat().format(value);
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Daily Transaction Volume</h2>
          <p className="text-sm text-gray-600">Number of transactions processed each day</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setPeriod(30)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              period === 30
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              period === 90
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
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