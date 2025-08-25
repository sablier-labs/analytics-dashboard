import { Select } from "@/components/ui/Select";
import type { TimeRange } from "@/lib/types";

type DashboardHeaderProps = {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
};

const timeRangeOptions = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last year", value: "1y" },
  { label: "All time", value: "all" },
];

export function DashboardHeader({ timeRange, onTimeRangeChange }: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sablier Analytics</h1>
          <p className="text-gray-600 mt-1">
            Protocol metrics for token distribution, vesting, payroll, and more
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
              Time Range:
            </label>
            <Select
              id="timeRange"
              options={timeRangeOptions}
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
              className="w-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
