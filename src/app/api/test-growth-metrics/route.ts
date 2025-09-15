import { NextResponse } from "next/server";
import { fetchGrowthRateMetrics } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchGrowthRateMetrics();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch growth metrics:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}