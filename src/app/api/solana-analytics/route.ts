import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import { fetchSolanaCampaigns, fetchSolanaClaims24h } from "@/lib/services/solana-airdrops-graphql";
import {
  fetchSolanaMAU,
  fetchSolanaStreams,
  fetchSolanaStreams24h,
  fetchSolanaTopTokens,
  fetchSolanaTransactions,
  fetchSolanaUsers,
} from "@/lib/services/solana-lockup-graphql";
import type { SolanaAnalyticsData } from "@/lib/solana-cache-update";

export async function GET() {
  let cached: SolanaAnalyticsData | undefined;

  try {
    cached = await get<SolanaAnalyticsData>("solana_analytics");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    console.log("Fetching Solana data directly from GraphQL");

    const [
      mau,
      totalUsers,
      totalStreams,
      totalCampaigns,
      topSPLTokens,
      totalTransactions,
      streams24h,
      claims24h,
    ] = await Promise.all([
      fetchSolanaMAU().catch(() => 0),
      fetchSolanaUsers().catch(() => 0),
      fetchSolanaStreams().catch(() => 0),
      fetchSolanaCampaigns().catch(() => 0),
      fetchSolanaTopTokens().catch(() => []),
      fetchSolanaTransactions().catch(() => 0),
      fetchSolanaStreams24h().catch(() => 0),
      fetchSolanaClaims24h().catch(() => 0),
    ]);

    const fallbackData: SolanaAnalyticsData = {
      claims24h,
      lastUpdated: new Date().toISOString(),
      mau,
      streams24h,
      topSPLTokens,
      totalCampaigns,
      totalStreams,
      totalTransactions,
      totalUsers,
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Error fetching Solana analytics data:", error);
    return NextResponse.json({ error: "Failed to fetch Solana analytics data" }, { status: 500 });
  }
}
