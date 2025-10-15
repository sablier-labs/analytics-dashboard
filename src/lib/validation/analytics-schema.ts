import { z } from "zod";

// Schema for OptimizedStablecoinStream
const OptimizedStablecoinStreamSchema = z.object({
  asset: z.object({
    decimals: z.string(),
    symbol: z.string(),
  }),
  chainId: z.string(),
  contract: z.string(),
  depositAmount: z.string(),
  endTime: z.string(),
  id: z.string(),
  startTime: z.string(),
  tokenId: z.string(),
});

// Schema for TimeBasedStablecoinVolume
const TimeBasedStablecoinVolumeSchema = z.object({
  past30Days: z.number(),
  past90Days: z.number(),
  past180Days: z.number(),
  pastYear: z.number(),
});

// Schema for TimeBasedUserCounts
const TimeBasedUserCountsSchema = z.object({
  past30Days: z.number(),
  past90Days: z.number(),
  past180Days: z.number(),
  pastYear: z.number(),
});

// Schema for TimeBasedTransactionCounts
const TimeBasedTransactionCountsSchema = z.object({
  past30Days: z.number(),
  past90Days: z.number(),
  past180Days: z.number(),
  pastYear: z.number(),
});

// Schema for MonthlyUserGrowth
const MonthlyUserGrowthSchema = z.object({
  cumulativeUsers: z.number(),
  month: z.string(),
  newUsers: z.number(),
});

// Schema for ChainDistribution
const ChainDistributionSchema = z.object({
  chainId: z.string(),
  userCount: z.number(),
});

// Schema for MonthlyTransactionGrowth
const MonthlyTransactionGrowthSchema = z.object({
  cumulativeTransactions: z.number(),
  month: z.string(),
  newTransactions: z.number(),
});

// Schema for TopAsset
const TopAssetSchema = z.object({
  address: z.string(),
  assetId: z.string(),
  chainId: z.string(),
  decimals: z.number(),
  name: z.string(),
  streamCount: z.number(),
  symbol: z.string(),
});

// Schema for GrowthRateMetrics
const GrowthRateMetricsSchema = z.object({
  averageTransactionGrowthRate: z.number().nullable(),
  transactionGrowthRate: z.number().nullable(),
  userGrowthRate: z.number().nullable(),
});

// Schema for MonthlyStreamCreation
const MonthlyStreamCreationSchema = z.object({
  count: z.number(),
  month: z.string(),
});

// Schema for StreamDurationStats
const StreamDurationStatsSchema = z.object({
  average: z.number(),
  max: z.number(),
  median: z.number(),
  min: z.number(),
});

// Schema for StreamProperties
const StreamPropertiesSchema = z.object({
  both: z.number(),
  cancelable: z.number(),
  total: z.number(),
  transferable: z.number(),
});

// Schema for StreamCategoryDistribution
const StreamCategoryDistributionSchema = z.object({
  dynamic: z.number(),
  linear: z.number(),
  total: z.number(),
  tranched: z.number(),
});

// Schema for ActiveVsCompletedStreams
const ActiveVsCompletedStreamsSchema = z.object({
  active: z.number(),
  completed: z.number(),
  total: z.number(),
});

// Schema for Activity24Hours
const Activity24HoursSchema = z.object({
  claimsCreated: z.number(),
  streamsCreated: z.number(),
  totalTransactions: z.number(),
});

// Main CachedAnalyticsData schema
export const CachedAnalyticsDataSchema = z.object({
  activeVsCompletedStreams: ActiveVsCompletedStreamsSchema,
  activity24Hours: Activity24HoursSchema,
  chainDistribution: z.array(ChainDistributionSchema),
  growthRateMetrics: GrowthRateMetricsSchema,
  largestStablecoinStreams: z.array(OptimizedStablecoinStreamSchema),
  lastUpdated: z.string(),
  monthlyStreamCreation: z.array(MonthlyStreamCreationSchema),
  monthlyTransactionGrowth: z.array(MonthlyTransactionGrowthSchema),
  monthlyUserGrowth: z.array(MonthlyUserGrowthSchema),
  streamCategoryDistribution: StreamCategoryDistributionSchema,
  streamDurationStats: StreamDurationStatsSchema,
  streamProperties: StreamPropertiesSchema,
  timeBasedStablecoinVolume: TimeBasedStablecoinVolumeSchema,
  timeBasedTransactions: TimeBasedTransactionCountsSchema,
  timeBasedUsers: TimeBasedUserCountsSchema,
  topAssets: z.array(TopAssetSchema),
  totalClaims: z.number(),
  totalStablecoinVolume: z.number(),
  totalTransactions: z.number(),
  totalUsers: z.number(),
  totalVestingStreams: z.number(),
});

// Export type for use in TypeScript
export type ValidatedAnalyticsData = z.infer<typeof CachedAnalyticsDataSchema>;
