"use client";

import { useState } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  generateMonthlyActiveUsers,
  generateProtocolMetrics,
  generateUseCaseMetrics,
} from "@/lib/data/mock-data";
import type { ChartData, TimeRange } from "@/lib/types";
import { formatMonth } from "@/lib/utils/format";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const protocolMetrics = generateProtocolMetrics();
  const useCaseMetrics = generateUseCaseMetrics();
  const monthlyActiveUsersData = generateMonthlyActiveUsers();

  const chartData: ChartData = {
    datasets: [
      {
        backgroundColor: "rgba(226, 92, 49, 0.1)",
        borderColor: "rgb(226, 92, 49)",
        borderWidth: 3,
        data: monthlyActiveUsersData.map((data) => data.totalUsers),
        fill: true,
        label: "Monthly Active Users",
      },
      {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        data: monthlyActiveUsersData.map((data) => data.newUsers),
        fill: false,
        label: "New Users",
      },
    ],
    labels: monthlyActiveUsersData.map((data) => formatMonth(data.month)),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Value Locked"
            value={protocolMetrics.totalValueLocked}
            previousValue={protocolMetrics.totalValueLocked * 0.92}
            format="currency"
            subtitle="Across all chains"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
          />

          <KpiCard
            title="Total Streams"
            value={protocolMetrics.totalStreams}
            previousValue={protocolMetrics.totalStreams * 0.89}
            format="number"
            subtitle="Created to date"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
          />

          <KpiCard
            title="Total Users"
            value={protocolMetrics.totalUsers}
            previousValue={protocolMetrics.totalUsers * 0.94}
            format="number"
            subtitle="Unique addresses"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />

          <KpiCard
            title="Monthly Volume"
            value={protocolMetrics.monthlyVolume}
            previousValue={protocolMetrics.monthlyVolume * 0.87}
            format="currency"
            subtitle="Last 30 days"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <LineChart title="Monthly Active Users Trend" data={chartData} height={350} />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Use Case Distribution</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(useCaseMetrics).map(([useCase, metrics]) => {
                  const totalStreams = Object.values(useCaseMetrics).reduce(
                    (sum, m) => sum + m.streams,
                    0,
                  );
                  const percentage = (metrics.streams / totalStreams) * 100;

                  return (
                    <div key={useCase} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              useCase === "vesting"
                                ? "#e25c31"
                                : useCase === "payroll"
                                  ? "#3b82f6"
                                  : useCase === "airdrops"
                                    ? "#10b981"
                                    : useCase === "grants"
                                      ? "#f59e0b"
                                      : "#6b7280",
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {useCase}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {metrics.streams.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
