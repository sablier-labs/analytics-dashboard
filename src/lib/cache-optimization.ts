/**
 * Cache Optimization Utilities
 * Implements data retention limits and size optimization for Edge Config storage
 */

import type {
  ChainDistribution as AirdropsChainDistribution,
  MonthlyCampaignCreation,
  MonthlyClaimTrend,
  OptimizedTopPerformingCampaign,
} from "./services/airdrops-graphql";
import type { OptimizedStablecoinStream } from "./services/cache";
import type {
  ChainDistribution,
  MonthlyStreamCreation,
  MonthlyTransactionGrowth,
  MonthlyUserGrowth,
  TopAsset,
} from "./services/graphql";

// Configuration for data retention limits
export const CACHE_LIMITS = {
  AIRDROP_CHAIN_LIMIT: 8, // Limit chain distribution for airdrops

  // Airdrops limits
  AIRDROP_MONTHLY_MONTHS: 12, // Limit to 12 months for airdrops
  CHAIN_DISTRIBUTION_LIMIT: 10, // Limit chain distribution entries
  // Main analytics limits
  MONTHLY_DATA_MONTHS: 24, // Limit monthly data to 24 months
  TOP_ASSETS_LIMIT: 15, // Limit top assets
  TOP_CAMPAIGNS_LIMIT: 8, // Reduce from 10 to 8
  TOP_STABLECOIN_STREAMS: 20, // Reduce from 25 to 20
} as const;

/**
 * Optimizes monthly growth data by limiting to recent months
 */
export function limitMonthlyData<T extends { month: string }>(data: T[], monthsLimit: number): T[] {
  if (!data || data.length <= monthsLimit) {
    return data;
  }

  // Sort by month (newest first) and take the most recent entries
  return data
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, monthsLimit)
    .sort((a, b) => a.month.localeCompare(b.month)); // Sort back to chronological order
}

/**
 * Optimizes array data by limiting to top N entries
 */
export function limitTopEntries<T>(data: T[], limit: number): T[] {
  if (!data || data.length <= limit) {
    return data;
  }
  return data.slice(0, limit);
}

/**
 * Removes unnecessary fields from stablecoin streams to reduce size
 */
export function compressStablecoinStreams(
  streams: OptimizedStablecoinStream[],
): OptimizedStablecoinStream[] {
  return streams.map((stream) => ({
    asset: {
      decimals: stream.asset.decimals,
      symbol: stream.asset.symbol,
    },
    chainId: stream.chainId,
    contract: stream.contract,
    depositAmount: stream.depositAmount,
    endTime: stream.endTime.split("T")[0] + "T23:59:59Z",
    id: stream.id,
    // Keep only essential time fields (remove seconds precision for older streams)
    startTime: stream.startTime.split("T")[0] + "T00:00:00Z",
    tokenId: stream.tokenId,
  }));
}

/**
 * Optimizes main analytics cache data
 */
export function optimizeAnalyticsCache(data: {
  monthlyUserGrowth: MonthlyUserGrowth[];
  monthlyTransactionGrowth: MonthlyTransactionGrowth[];
  monthlyStreamCreation: MonthlyStreamCreation[];
  topAssets: TopAsset[];
  chainDistribution: ChainDistribution[];
  largestStablecoinStreams: OptimizedStablecoinStream[];
  [key: string]: any;
}) {
  return {
    ...data,
    chainDistribution: limitTopEntries(
      data.chainDistribution,
      CACHE_LIMITS.CHAIN_DISTRIBUTION_LIMIT,
    ),

    // Optimize and limit stablecoin streams
    largestStablecoinStreams: compressStablecoinStreams(
      limitTopEntries(data.largestStablecoinStreams, CACHE_LIMITS.TOP_STABLECOIN_STREAMS),
    ),
    monthlyStreamCreation: limitMonthlyData(
      data.monthlyStreamCreation,
      CACHE_LIMITS.MONTHLY_DATA_MONTHS,
    ),
    monthlyTransactionGrowth: limitMonthlyData(
      data.monthlyTransactionGrowth,
      CACHE_LIMITS.MONTHLY_DATA_MONTHS,
    ),
    // Limit monthly data to recent periods
    monthlyUserGrowth: limitMonthlyData(data.monthlyUserGrowth, CACHE_LIMITS.MONTHLY_DATA_MONTHS),

    // Limit top entries
    topAssets: limitTopEntries(data.topAssets, CACHE_LIMITS.TOP_ASSETS_LIMIT),
  };
}

/**
 * Optimizes airdrops cache data
 */
export function optimizeAirdropsCache(data: {
  monthlyCampaignCreation: MonthlyCampaignCreation[];
  monthlyClaimTrends: MonthlyClaimTrend[];
  chainDistribution: AirdropsChainDistribution[];
  topPerformingCampaigns: OptimizedTopPerformingCampaign[];
  [key: string]: any;
}) {
  return {
    ...data,

    // Limit top entries
    chainDistribution: limitTopEntries(data.chainDistribution, CACHE_LIMITS.AIRDROP_CHAIN_LIMIT),
    // Limit monthly data
    monthlyCampaignCreation: limitMonthlyData(
      data.monthlyCampaignCreation,
      CACHE_LIMITS.AIRDROP_MONTHLY_MONTHS,
    ),
    monthlyClaimTrends: limitMonthlyData(
      data.monthlyClaimTrends,
      CACHE_LIMITS.AIRDROP_MONTHLY_MONTHS,
    ),
    topPerformingCampaigns: limitTopEntries(
      data.topPerformingCampaigns,
      CACHE_LIMITS.TOP_CAMPAIGNS_LIMIT,
    ),
  };
}

/**
 * Estimates the size of cached data in bytes
 */
export function estimateCacheSize(data: any): number {
  try {
    const str = JSON.stringify(data);
    return Buffer.byteLength(str, "utf8");
  } catch {
    return 0;
  }
}

/**
 * Formats bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Validates cache size and logs warnings if too large
 */
export function validateCacheSize(data: any, cacheKey: string): boolean {
  const size = estimateCacheSize(data);
  const sizeFormatted = formatBytes(size);

  console.log(`📊 ${cacheKey} cache size: ${sizeFormatted}`);

  // Warning thresholds
  if (size > 1000000) {
    // 1MB
    console.warn(
      `⚠️ ${cacheKey} cache is very large (${sizeFormatted}) - consider more aggressive optimization`,
    );
    return false;
  } else if (size > 500000) {
    // 500KB
    console.warn(`⚠️ ${cacheKey} cache is large (${sizeFormatted}) - monitor for growth`);
  } else if (size > 250000) {
    // 250KB
    console.log(`ℹ️ ${cacheKey} cache size is moderate (${sizeFormatted})`);
  } else {
    console.log(`✅ ${cacheKey} cache size is optimal (${sizeFormatted})`);
  }

  return true;
}

/**
 * Creates a minimal cache summary for debugging
 */
export function createCacheSummary(data: any): Record<string, any> {
  const summary: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      summary[key] = `Array(${value.length})`;
    } else if (typeof value === "object" && value !== null) {
      summary[key] = Object.keys(value).length + " keys";
    } else {
      summary[key] = typeof value;
    }
  });

  return summary;
}
