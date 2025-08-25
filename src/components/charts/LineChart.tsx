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
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChartData } from "@/lib/types";

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

type LineChartProps = {
  title: string;
  data: ChartData;
  height?: number;
};

export function LineChart({ title, data, height = 300 }: LineChartProps) {
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
          padding: 20,
          usePointStyle: true,
        },
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
        titleColor: "white",
      },
    },
    responsive: true,
    scales: {
      x: {
        border: {
          display: false,
        },
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
