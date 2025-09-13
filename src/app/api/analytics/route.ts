import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { CachedAnalyticsData } from "@/lib/services/cache";

export async function GET() {
  try {
    const cached = await get<CachedAnalyticsData>("analytics");

    if (!cached) {
      // In local development, Edge Config might be empty
      // Return a minimal structure so components don't need fallback fetching
      console.log("Edge Config cache miss - components will use fallback data fetching");
      return NextResponse.json({ error: "No cached data available" }, { status: 404 });
    }

    return NextResponse.json(cached);
  } catch (error) {
    console.error("Error reading from Edge Config:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
