import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateAirdropsCache } from "@/lib/airdrops-cache-update";
import { updateAnalyticsCache } from "@/lib/cache-update-optimized";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual refresh triggered from UI...");

    // Update both caches in parallel for efficiency
    const [analyticsResult, airdropsResult] = await Promise.allSettled([
      updateAnalyticsCache(),
      updateAirdropsCache(),
    ]);

    const results = {
      airdrops:
        airdropsResult.status === "fulfilled"
          ? airdropsResult.value
          : { error: airdropsResult.reason?.message || "Unknown error", success: false },
      analytics:
        analyticsResult.status === "fulfilled"
          ? analyticsResult.value
          : { error: analyticsResult.reason?.message || "Unknown error", success: false },
    };

    const overallSuccess = results.analytics.success && results.airdrops.success;

    return NextResponse.json({
      message: overallSuccess ? "Data refreshed successfully!" : "Some cache updates failed",
      results,
      success: overallSuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in manual refresh:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to refresh data",
        success: false,
      },
      { status: 500 },
    );
  }
}
