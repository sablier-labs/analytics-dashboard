import { get } from "@vercel/edge-config";
import { AverageTransactionsPerUser } from "@/components/AverageTransactionsPerUser";
import { ChainDistributionChart } from "@/components/ChainDistributionChart";
import { CumulativeTransactionChart } from "@/components/CumulativeTransactionChart";
import { CumulativeUserChart } from "@/components/CumulativeUserChart";
import { DailyTransactionVolumeChart } from "@/components/DailyTransactionVolumeChart";
import { GrowthRateIndicators } from "@/components/GrowthRateIndicators";
import { TimeBasedTransactionCounters } from "@/components/TimeBasedTransactionCounters";
import { TimeBasedUserCounters } from "@/components/TimeBasedUserCounters";
import { TransactionCounter } from "@/components/TransactionCounter";
import { UserCounter } from "@/components/UserCounter";

interface CachedAnalyticsData {
  totalUsers: number;
  totalTransactions: number;
  timeBasedUsers: {
    past30Days: number;
    past90Days: number;
    past180Days: number;
    pastYear: number;
  };
  timeBasedTransactions: {
    past30Days: number;
    past90Days: number;
    past180Days: number;
    pastYear: number;
  };
  monthlyUserGrowth: Array<{
    month: string;
    cumulativeUsers: number;
    newUsers: number;
  }>;
  chainDistribution: Array<{
    chainId: string;
    userCount: number;
  }>;
  monthlyTransactionGrowth: Array<{
    month: string;
    cumulativeTransactions: number;
    newTransactions: number;
  }>;
  averageTransactionsPerUser: number;
  dailyTransactionVolume: Array<{
    date: string;
    count: number;
  }>;
  growthRateMetrics: {
    userGrowthRate: number;
    transactionGrowthRate: number;
    averageTransactionGrowthRate: number;
  };
  lastUpdated?: string;
}

// Simple number display component
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  // Try to get cached data, fallback to showing basic info
  let cachedData: CachedAnalyticsData | null = null;
  
  try {
    cachedData = await get<CachedAnalyticsData>("analytics");
  } catch (error) {
    console.error("Error reading from Edge Config:", error);
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const userIcon = (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  const transactionIcon = (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const avgIcon = (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sablier Analytics</h1>
          <p className="text-xl text-gray-600">
            Protocol metrics for token distribution, vesting, payroll, and more
          </p>
          {cachedData && (
            <p className="text-sm text-gray-500 mt-2">
              ⚡ Powered by Edge Config - Last updated: {new Date(cachedData.lastUpdated || "").toLocaleString()}
            </p>
          )}
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          {cachedData ? (
            <>
              {/* Fast cached data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <StatCard 
                  title="Total Users" 
                  value={formatNumber(cachedData.totalUsers)} 
                  icon={userIcon} 
                />
                <StatCard 
                  title="Total Transactions" 
                  value={formatNumber(cachedData.totalTransactions)} 
                  icon={transactionIcon} 
                />
                <StatCard 
                  title="Avg Transactions/User" 
                  value={cachedData.averageTransactionsPerUser.toFixed(2)} 
                  icon={avgIcon} 
                />
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(cachedData.timeBasedUsers.past30Days)}</p>
                    <p className="text-sm text-gray-600">Users (30 days)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(cachedData.timeBasedTransactions.past30Days)}</p>
                    <p className="text-sm text-gray-600">Transactions (30 days)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{cachedData.chainDistribution.length}</p>
                    <p className="text-sm text-gray-600">Active Chains</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{cachedData.growthRateMetrics.userGrowthRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">User Growth Rate</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Fallback to slow components if cache fails */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <UserCounter />
                <TransactionCounter />
                <AverageTransactionsPerUser />
              </div>
            </>
          )}

          {/* Keep the slow components for now to show the difference */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">📊 Detailed Charts (Loading from GraphQL - Slow)</p>
          </div>
          
          <TimeBasedUserCounters />
          <TimeBasedTransactionCounters />
          <GrowthRateIndicators />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CumulativeUserChart />
            <CumulativeTransactionChart />
          </div>

          <DailyTransactionVolumeChart />
          <ChainDistributionChart />
        </div>
      </div>
    </div>
  );
}