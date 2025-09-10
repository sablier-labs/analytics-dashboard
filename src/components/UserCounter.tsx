"use client";

import { useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SourceCodeLink } from "./SourceCodeLink";
import { SharePanel } from "./SharePanel";

export function UserCounter() {
  const { data, loading, error } = useAnalytics();
  const userCount = data?.totalUsers || null;
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading user count</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 relative"
    >
      <div className="absolute top-3 right-3">
        <SharePanel 
          title="Total Users"
          elementRef={containerRef}
          description="Total number of unique users on the Sablier protocol"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
            <SourceCodeLink fileName="graphql.ts" lineNumber={135} tooltip="View fetchTotalUsers source" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {userCount !== null ? formatNumber(userCount) : "—"}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-sablier-100 dark:bg-sablier-900 rounded-lg">
          <svg
            className="w-6 h-6 text-sablier-600 dark:text-sablier-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
