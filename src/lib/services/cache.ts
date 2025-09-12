import { get } from "@vercel/edge-config";
import type {
  ChainDistribution,
  GrowthRateMetrics,
  MonthlyTransactionGrowth,
  MonthlyUserGrowth,
  TimeBasedTransactionCounts,
  TimeBasedUserCounts,
  TopAsset,
} from "./graphql";
import {
  fetchChainDistribution,
  fetchGrowthRateMetrics,
  fetchMonthlyTransactionGrowth,
  fetchMonthlyUserGrowth,
  fetchTimeBasedTransactionCounts,
  fetchTimeBasedUserCounts,
  fetchTopAssetsByStreamCount,
  fetchTotalTransactions,
  fetchTotalUsers,
} from "./graphql";

export interface CachedAnalyticsData {
  totalUsers: number;
  totalTransactions: number;
  timeBasedUsers: TimeBasedUserCounts;
  timeBasedTransactions: TimeBasedTransactionCounts;
  monthlyUserGrowth: MonthlyUserGrowth[];
  chainDistribution: ChainDistribution[];
  monthlyTransactionGrowth: MonthlyTransactionGrowth[];
  topAssets: TopAsset[];
  growthRateMetrics: GrowthRateMetrics;
  lastUpdated: string;
}

async function getCachedData(): Promise<CachedAnalyticsData | null> {
  try {
    const cached = await get<CachedAnalyticsData>("analytics");
    return cached || null;
  } catch (error) {
    console.error("Error reading from Edge Config:", error);
    return null;
  }
}

export async function getCachedTotalUsers(): Promise<number> {
  const cached = await getCachedData();
  if (cached?.totalUsers !== undefined) {
    return cached.totalUsers;
  }
  console.log("Cache miss - fetching total users from GraphQL");
  return fetchTotalUsers();
}

export async function getCachedTotalTransactions(): Promise<number> {
  const cached = await getCachedData();
  if (cached?.totalTransactions !== undefined) {
    return cached.totalTransactions;
  }
  console.log("Cache miss - fetching total transactions from GraphQL");
  return fetchTotalTransactions();
}

export async function getCachedTimeBasedUserCounts(): Promise<TimeBasedUserCounts> {
  const cached = await getCachedData();
  if (cached?.timeBasedUsers) {
    return cached.timeBasedUsers;
  }
  console.log("Cache miss - fetching time-based user counts from GraphQL");
  return fetchTimeBasedUserCounts();
}

export async function getCachedTimeBasedTransactionCounts(): Promise<TimeBasedTransactionCounts> {
  const cached = await getCachedData();
  if (cached?.timeBasedTransactions) {
    return cached.timeBasedTransactions;
  }
  console.log("Cache miss - fetching time-based transaction counts from GraphQL");
  return fetchTimeBasedTransactionCounts();
}

export async function getCachedMonthlyUserGrowth(): Promise<MonthlyUserGrowth[]> {
  const cached = await getCachedData();
  if (cached?.monthlyUserGrowth) {
    return cached.monthlyUserGrowth;
  }
  console.log("Cache miss - fetching monthly user growth from GraphQL");
  return fetchMonthlyUserGrowth();
}

export async function getCachedChainDistribution(): Promise<ChainDistribution[]> {
  const cached = await getCachedData();
  if (cached?.chainDistribution) {
    return cached.chainDistribution;
  }
  console.log("Cache miss - fetching chain distribution from GraphQL");
  return fetchChainDistribution();
}

export async function getCachedMonthlyTransactionGrowth(): Promise<MonthlyTransactionGrowth[]> {
  const cached = await getCachedData();
  if (cached?.monthlyTransactionGrowth) {
    return cached.monthlyTransactionGrowth;
  }
  console.log("Cache miss - fetching monthly transaction growth from GraphQL");
  return fetchMonthlyTransactionGrowth();
}

export async function getCachedTopAssets(): Promise<TopAsset[]> {
  const cached = await getCachedData();
  if (cached?.topAssets) {
    return cached.topAssets;
  }
  console.log("Cache miss - fetching top assets from GraphQL");
  return fetchTopAssetsByStreamCount();
}

export async function getCachedGrowthRateMetrics(): Promise<GrowthRateMetrics> {
  const cached = await getCachedData();
  if (cached?.growthRateMetrics) {
    return cached.growthRateMetrics;
  }
  console.log("Cache miss - fetching growth rate metrics from GraphQL");
  return fetchGrowthRateMetrics();
}

export async function getCacheInfo(): Promise<{
  isCached: boolean;
  lastUpdated?: string;
  age?: string;
}> {
  const cached = await getCachedData();

  if (!cached?.lastUpdated) {
    return { isCached: false };
  }

  const lastUpdated = new Date(cached.lastUpdated);
  const now = new Date();
  const ageInHours = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));

  return {
    age: ageInHours < 24 ? `${ageInHours} hours ago` : `${Math.floor(ageInHours / 24)} days ago`,
    isCached: true,
    lastUpdated: cached.lastUpdated,
  };
}
