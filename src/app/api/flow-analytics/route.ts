import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { FlowAnalyticsData } from "@/lib/flow-cache-update";

// Maximum cache age in milliseconds (48 hours)
const MAX_CACHE_AGE_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  let cached: FlowAnalyticsData | undefined;

  // Try Edge Config cache first
  try {
    cached = await get<FlowAnalyticsData>("flow_analytics");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  // CRITICAL: Check cache staleness to prevent serving outdated data
  if (cached) {
    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
    const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

    if (cacheAge > MAX_CACHE_AGE_MS) {
      console.warn(
        `⚠️  Flow cache is stale (${cacheAgeHours} hours old, max ${MAX_CACHE_AGE_MS / (1000 * 60 * 60)} hours). Falling back to direct fetch.`,
      );
      cached = undefined; // Force fallback to fresh data
    } else {
      console.log(`✅ Serving fresh Flow cached data (${cacheAgeHours} hours old)`);
    }
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fallback: direct GraphQL fetch
  try {
    const { fetchFlowDeposits } = await import("@/lib/services/flow-graphql");

    const totalDeposits = await fetchFlowDeposits();

    const fallbackData: FlowAnalyticsData = {
      lastUpdated: new Date().toISOString(),
      totalDeposits,
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Failed to fetch Flow analytics data:", error);
    return NextResponse.json({ error: "Failed to fetch Flow analytics data" }, { status: 500 });
  }
}
