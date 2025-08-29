"use client";

import { useEffect, useState } from "react";
import { fetchTotalTransactions } from "@/lib/services/graphql";

export function TransactionCounter() {
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactionCount() {
      try {
        setLoading(true);
        setError(null);
        const count = await fetchTotalTransactions();
        setTransactionCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction count');
      } finally {
        setLoading(false);
      }
    }

    loadTransactionCount();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-600 mb-2">Error loading transaction count</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">
            {transactionCount !== null ? formatNumber(transactionCount) : '—'}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}