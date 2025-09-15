"use client";

import { useRef, useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { StreamProperties as StreamPropertiesType } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function StreamProperties() {
  const { data, loading, error } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackData, setFallbackData] = useState<StreamPropertiesType | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // If cache doesn't have streamProperties, fetch directly
  useEffect(() => {
    if (!loading && data && !data.streamProperties && !fallbackData && !fallbackLoading) {
      setFallbackLoading(true);
      fetch('/api/fallback-stream-properties')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setFallbackData(result.data);
            console.log(`Stream properties loaded via fallback: ${result.data.both} streams with both properties`);
          }
        })
        .catch(err => {
          console.error('Failed to fetch fallback stream properties:', err);
          // In case of error, set a default object to prevent infinite loading
          setFallbackData({ cancelable: 0, transferable: 0, both: 0, total: 0 });
        })
        .finally(() => setFallbackLoading(false));
    }
  }, [data, loading, fallbackData, fallbackLoading]);

  // Use cached data if available, otherwise use fallback data
  const propertiesData = data?.streamProperties || fallbackData;

  if (loading || fallbackLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading stream properties data</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!propertiesData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No stream properties data available</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1) + '%';
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stream Properties</h2>
            <SourceCodeLink fileName="graphql.ts" lineNumber={1060} tooltip="View fetchStreamProperties source" />
          </div>
          <SharePanel 
            title="Stream Properties"
            elementRef={containerRef}
            description="Breakdown of cancelable and transferable stream properties"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Flexibility options available on vesting streams
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cancelable Streams */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatNumber(propertiesData.cancelable)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {formatPercentage(propertiesData.cancelable, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Cancelable
          </div>
        </div>

        {/* Transferable Streams */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatNumber(propertiesData.transferable)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {formatPercentage(propertiesData.transferable, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Transferable
          </div>
        </div>

        {/* Both Properties */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {formatNumber(propertiesData.both)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {formatPercentage(propertiesData.both, propertiesData.total)}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Both
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Total streams: {formatNumber(propertiesData.total)}
        </p>
      </div>
    </div>
  );
}