import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateAirdropsCache } from "@/lib/airdrops-cache-update";
import { updateAnalyticsCache } from "@/lib/cache-update-optimized";

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get("user-agent");

  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Allow Vercel Cron requests (check multiple possible header formats)
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "1" || vercelCronHeader === "true") {
    return true;
  }

  // Allow requests with correct API key/secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Allow internal requests (for manual refresh)
  if (userAgent?.includes("undici")) {
    return true;
  }

  // Check if request comes from Vercel infrastructure (backup auth method)
  if (userAgent?.includes("vercel")) {
    return true;
  }

  // Allow requests from Vercel deployment URLs
  const vercelDeploymentUrl = request.headers.get("x-vercel-deployment-url");
  if (vercelDeploymentUrl) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Verify the request is authorized
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🚀 Starting optimized update for all caches...");

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
      message: overallSuccess
        ? "All caches updated successfully with optimizations"
        : "Some cache updates failed",
      results,
      success: overallSuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating all caches:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to update caches",
        success: false,
      },
      { status: 500 },
    );
  }
}

// Also allow GET requests for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
