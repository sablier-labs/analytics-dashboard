import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { CachedAnalyticsData } from "@/lib/services/cache";

export async function GET() {
  try {
    const cached = await get<CachedAnalyticsData>("analytics");

    if (!cached) {
      return NextResponse.json({ error: "No cached data available" }, { status: 404 });
    }

    return NextResponse.json(cached);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
