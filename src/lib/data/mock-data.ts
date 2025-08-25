import type {
  MonthlyActiveUsers,
  ProtocolMetrics,
  TokenDistribution,
  UseCaseMetrics,
} from "../types";

export function generateMonthlyActiveUsers(): MonthlyActiveUsers[] {
  const months = ["2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"];

  return months.map((month, index) => ({
    chainBreakdown: {
      arbitrum: Math.floor(Math.random() * 4000) + 3000,
      base: Math.floor(Math.random() * 3000) + 2000,
      ethereum: Math.floor(Math.random() * 12000) + 8000,
      optimism: Math.floor(Math.random() * 2000) + 1000,
      polygon: Math.floor(Math.random() * 6000) + 4000,
    },
    month,
    newUsers: 4000 + Math.floor(Math.random() * 1500),
    returningUsers: 21000 + index * 3000 + Math.floor(Math.random() * 1500),
    totalUsers: 25000 + index * 3500 + Math.floor(Math.random() * 2000),
  }));
}

export function generateProtocolMetrics(): ProtocolMetrics {
  return {
    chains: [
      {
        name: "ethereum",
        streamCount: 358_430,
        tvl: 542_300_000,
        userCount: 185_320,
      },
      {
        name: "polygon",
        streamCount: 95_240,
        tvl: 156_800_000,
        userCount: 65_120,
      },
      {
        name: "arbitrum",
        streamCount: 62_180,
        tvl: 89_400_000,
        userCount: 28_640,
      },
      {
        name: "base",
        streamCount: 25_971,
        tvl: 42_100_000,
        userCount: 12_896,
      },
      {
        name: "optimism",
        streamCount: 11_000,
        tvl: 16_600_000,
        userCount: 5_500,
      },
    ],
    monthlyVolume: 125_430_000,
    totalStreams: 552_821,
    totalUsers: 297_476,
    totalValueLocked: 847_200_000,
  };
}

export function generateUseCaseMetrics(): UseCaseMetrics {
  return {
    airdrops: { streams: 89_260, volume: 98_500_000 },
    grants: { streams: 45_120, volume: 56_200_000 },
    other: { streams: 27_081, volume: 12_500_000 },
    payroll: { streams: 156_840, volume: 234_800_000 },
    vesting: { streams: 234_520, volume: 445_200_000 },
  };
}

export function generateTokenDistribution(): TokenDistribution[] {
  const tokens = [
    { symbol: "USDC", token: "USDC" },
    { symbol: "USDT", token: "USDT" },
    { symbol: "DAI", token: "DAI" },
    { symbol: "WETH", token: "WETH" },
    { symbol: "ARB", token: "ARB" },
    { symbol: "MATIC", token: "MATIC" },
  ];

  return tokens.map((token, index) => ({
    ...token,
    activeStreams: 45_000 - index * 6_000 + Math.floor(Math.random() * 2_000),
    averageStreamSize: 2_800 - index * 300 + Math.floor(Math.random() * 500),
    chainDistribution: {
      arbitrum: Math.floor(Math.random() * 20_000_000) + 10_000_000,
      base: Math.floor(Math.random() * 15_000_000) + 8_000_000,
      ethereum: Math.floor(Math.random() * 40_000_000) + 30_000_000,
      optimism: Math.floor(Math.random() * 10_000_000) + 5_000_000,
      polygon: Math.floor(Math.random() * 25_000_000) + 15_000_000,
    },
    totalStreamed: 125_000_000 - index * 18_000_000 + Math.floor(Math.random() * 5_000_000),
  }));
}
