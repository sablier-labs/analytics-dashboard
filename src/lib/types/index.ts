export type ChainId = "ethereum" | "polygon" | "arbitrum" | "base" | "optimism";

export type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

export type UseCaseType = "vesting" | "payroll" | "airdrops" | "grants";

export type MonthlyActiveUsers = {
  month: string;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  chainBreakdown: Record<ChainId, number>;
};

export type ProtocolMetrics = {
  totalValueLocked: number;
  totalStreams: number;
  totalUsers: number;
  monthlyVolume: number;
  chains: Array<{
    name: ChainId;
    tvl: number;
    streamCount: number;
    userCount: number;
  }>;
};

export type UseCaseMetrics = {
  vesting: { streams: number; volume: number };
  payroll: { streams: number; volume: number };
  airdrops: { streams: number; volume: number };
  grants: { streams: number; volume: number };
  other: { streams: number; volume: number };
};

export type TokenDistribution = {
  token: string;
  symbol: string;
  totalStreamed: number;
  activeStreams: number;
  averageStreamSize: number;
  chainDistribution: Record<ChainId, number>;
};

export type DashboardFilters = {
  timeRange: TimeRange;
  chains: ChainId[];
  tokens?: string[];
  useCase?: UseCaseType;
};

export type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
};

export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};
