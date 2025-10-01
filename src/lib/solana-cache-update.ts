import { fetchSolanaCampaigns, fetchSolanaClaims24h } from "./services/solana-airdrops-graphql";
import {
  fetchSolanaMAU,
  fetchSolanaStreams,
  fetchSolanaStreams24h,
  fetchSolanaTopTokens,
  fetchSolanaTransactions,
  fetchSolanaUsers,
} from "./services/solana-lockup-graphql";

export interface SolanaAnalyticsData {
  mau: number;
  totalUsers: number;
  totalStreams: number;
  totalCampaigns: number;
  topSPLTokens: Array<{
    mint: string;
    address: string;
    streamCount: number;
    symbol?: string;
    name?: string;
    logoURI?: string;
  }>;
  totalTransactions: number;
  streams24h: number;
  claims24h: number;
  lastUpdated: string;
}

export async function updateSolanaCache(): Promise<{
  success: boolean;
  message: string;
  dataPoints: {
    mau: number;
    totalUsers: number;
    totalStreams: number;
    totalCampaigns: number;
    topSPLTokens: number;
    totalTransactions: number;
    streams24h: number;
    claims24h: number;
  };
  lastUpdated: string;
}> {
  console.log("🌐 Starting Solana analytics cache update...");

  const results = await Promise.allSettled([
    fetchSolanaMAU(),
    fetchSolanaUsers(),
    fetchSolanaStreams(),
    fetchSolanaCampaigns(),
    fetchSolanaTopTokens(),
    fetchSolanaTransactions(),
    fetchSolanaStreams24h(),
    fetchSolanaClaims24h(),
  ]);

  const [
    mauResult,
    usersResult,
    streamsResult,
    campaignsResult,
    topTokensResult,
    transactionsResult,
    streams24hResult,
    claims24hResult,
  ] = results;

  const mau = mauResult.status === "fulfilled" ? mauResult.value : 0;
  const totalUsers = usersResult.status === "fulfilled" ? usersResult.value : 0;
  const totalStreams = streamsResult.status === "fulfilled" ? streamsResult.value : 0;
  const totalCampaigns = campaignsResult.status === "fulfilled" ? campaignsResult.value : 0;
  const topSPLTokens = topTokensResult.status === "fulfilled" ? topTokensResult.value : [];
  const totalTransactions =
    transactionsResult.status === "fulfilled" ? transactionsResult.value : 0;
  const streams24h = streams24hResult.status === "fulfilled" ? streams24hResult.value : 0;
  const claims24h = claims24hResult.status === "fulfilled" ? claims24hResult.value : 0;

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const metricNames = [
        "MAU",
        "Total Users",
        "Total Streams",
        "Total Campaigns",
        "Top SPL Tokens",
        "Total Transactions",
        "Streams 24h",
        "Claims 24h",
      ];
      console.error(`Error fetching ${metricNames[index]}:`, result.reason);
    }
  });

  const timestamp = new Date().toISOString();
  const cachedData: SolanaAnalyticsData = {
    claims24h,
    lastUpdated: timestamp,
    mau,
    streams24h,
    topSPLTokens,
    totalCampaigns,
    totalStreams,
    totalTransactions,
    totalUsers,
  };

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

  if (!edgeConfigId || !vercelAccessToken) {
    throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
  }

  const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
    body: JSON.stringify({
      items: [
        {
          key: "solana_analytics",
          operation: "upsert",
          value: cachedData,
        },
      ],
    }),
    headers: {
      Authorization: `Bearer ${vercelAccessToken}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Edge Config: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (result.status !== "ok") {
    throw new Error(`Edge Config update failed: ${JSON.stringify(result)}`);
  }

  console.log("✅ Solana analytics cache update completed successfully");
  console.log("📊 Solana metrics:");
  console.log(`   MAU: ${mau}`);
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   Total Streams: ${totalStreams}`);
  console.log(`   Total Campaigns: ${totalCampaigns}`);
  console.log(`   Top SPL Tokens: ${topSPLTokens.length}`);
  console.log(`   Total Transactions: ${totalTransactions}`);
  console.log(`   Streams 24h: ${streams24h}`);
  console.log(`   Claims 24h: ${claims24h}`);

  return {
    dataPoints: {
      claims24h,
      mau,
      streams24h,
      topSPLTokens: topSPLTokens.length,
      totalCampaigns,
      totalStreams,
      totalTransactions,
      totalUsers,
    },
    lastUpdated: timestamp,
    message: "Solana analytics cache updated successfully",
    success: true,
  };
}
