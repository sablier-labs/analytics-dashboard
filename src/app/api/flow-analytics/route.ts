import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { FlowAnalyticsData } from "@/lib/flow-cache-update";

export async function GET() {
  let cached: FlowAnalyticsData | undefined;

  // Try Edge Config cache first
  try {
    cached = await get<FlowAnalyticsData>("flow_analytics");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fallback: direct GraphQL fetch
  try {
    const { fetchFlowStreams } = await import("@/lib/services/flow-graphql");

    const totalStreams = await fetchFlowStreams().catch(() => 0);

    const fallbackData: FlowAnalyticsData = {
      lastUpdated: new Date().toISOString(),
      totalStreams,
    };

    return NextResponse.json(fallbackData);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch Flow analytics data" }, { status: 500 });
  }
}
