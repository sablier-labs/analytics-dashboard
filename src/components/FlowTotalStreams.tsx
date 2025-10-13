"use client";

import { Waves } from "lucide-react";
import { useRef } from "react";
import { useFlowAnalytics } from "@/hooks/useFlowAnalytics";
import { containerVariants } from "@/lib/variants";
import { SharePanel } from "./SharePanel";

export function FlowTotalStreams() {
  const { data, isLoading, error } = useFlowAnalytics();
  const totalStreams = data?.totalDeposits || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className={containerVariants({ elevation: "sm", rounded: "lg", spacing: "default" })}>
        <div className="animate-pulse">
          <div className="h-4 bg-bg-tertiary dark:bg-surface-hover rounded w-32 mb-2"></div>
          <div className="h-8 bg-bg-tertiary dark:bg-surface-hover rounded w-36"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading Payroll deposits
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (totalStreams === null) {
    return (
      <div className={containerVariants({ elevation: "sm", rounded: "lg", spacing: "default" })}>
        <p className="text-text-secondary">No Payroll deposits data available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${containerVariants({ elevation: "sm", rounded: "lg", spacing: "default" })} transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-secondary">Total Payroll Deposits</p>
        </div>
        <SharePanel
          title="Total Payroll Deposits"
          elementRef={containerRef}
          description="Deposit transactions for payroll streams"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-text-primary">{formatNumber(totalStreams)}</p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-primary/10 to-accent-primary/20 dark:from-accent-primary/20 dark:to-accent-primary/30 rounded-xl">
          <Waves className="w-5 h-5 text-accent-primary" />
        </div>
      </div>
    </div>
  );
}
