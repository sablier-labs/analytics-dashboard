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
import { useAirdropsAnalytics } from "@/hooks/useAirdropsAnalytics";
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

export function CampaignCreationTrend() {
  const { data, isLoading, error } = useAirdropsAnalytics();
  const campaignData = data?.monthlyCampaignCreation || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-200 dark:border-red-700 shadow-md p-8 transition-colors duration-200">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading campaign creation data</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!campaignData || campaignData.length === 0) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200">
        <p className="text-text-secondary">No campaign creation data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        data: campaignData.map((data) => data.count),
        fill: true,
        label: "Campaigns Created",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "rgb(59, 130, 246)",
        pointHoverRadius: 6,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
    labels: campaignData.map((data) => formatMonth(data.month)),
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
            return `${value} campaigns`;
          },
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            return campaignData[dataIndex].month;
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
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-md p-8 transition-colors duration-200"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Campaign Creation Trend
            </h2>
            <SourceCodeLink
              fileName="airdrops-graphql.ts"
              lineNumber={86}
              tooltip="View fetchMonthlyCampaignCreation source"
            />
          </div>
          <SharePanel
            title="Campaign Creation Trend"
            elementRef={containerRef}
            description="Monthly airdrop campaign creation over the last 12 months"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Monthly airdrop campaign creation over the last 12 months
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
