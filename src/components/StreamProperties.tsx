"use client";

import { useRef } from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import type { StreamProperties as StreamPropertiesType } from "@/lib/services/graphql";
import { SharePanel } from "./SharePanel";
import { SourceCodeLink } from "./SourceCodeLink";

export function StreamProperties() {
  const { data, loading, error } = useAnalyticsContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use cached data if available, otherwise use fallback data
  const propertiesData = data?.streamProperties || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <div className="animate-pulse">
          <div className="h-6 bg-bg-tertiary dark:bg-surface-hover rounded w-48 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            <div className="h-24 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
            <div className="h-24 bg-bg-tertiary dark:bg-surface-hover rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-red-300 dark:border-red-600 shadow-lg p-6 transition-all duration-200 ">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          Error loading stream properties data
        </p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!propertiesData) {
    return (
      <div className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 ">
        <p className="text-text-secondary">No stream properties data available</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1) + "%";
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-bg-secondary rounded-xl border border-border-default shadow-lg p-6 transition-all duration-200 "
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary">Stream Properties</h2>
            <SourceCodeLink
              fileName="graphql.ts"
              lineNumber={1060}
              tooltip="View fetchStreamProperties source"
            />
          </div>
          <SharePanel
            title="Stream Properties"
            elementRef={containerRef}
            description="Breakdown of cancelable and transferable stream properties"
          />
        </div>
        <p className="text-sm text-text-secondary">
          Flexibility options available on vesting streams
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cancelable Streams */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatNumber(propertiesData.cancelable)}
          </div>
          <div className="text-sm text-text-tertiary mb-2">
            {formatPercentage(propertiesData.cancelable, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-text-primary">Cancelable</div>
        </div>

        {/* Transferable Streams */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatNumber(propertiesData.transferable)}
          </div>
          <div className="text-sm text-text-tertiary mb-2">
            {formatPercentage(propertiesData.transferable, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-text-primary">Transferable</div>
        </div>

        {/* Both Properties */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {formatNumber(propertiesData.both)}
          </div>
          <div className="text-sm text-text-tertiary mb-2">
            {formatPercentage(propertiesData.both, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-text-primary">Both</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <p className="text-xs text-text-tertiary text-center">
          Total streams: {formatNumber(propertiesData.total)}
        </p>
      </div>
    </div>
  );
}
