import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateAnalyticsCache } from "@/lib/cache-update";

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get("user-agent");

  // Log all headers for debugging cron issues
  console.log("=== UPDATE-CACHE REQUEST HEADERS ===");
  console.log("User-Agent:", userAgent);
  console.log("Authorization:", authHeader ? "present" : "missing");
  console.log("x-vercel-cron:", request.headers.get("x-vercel-cron"));
  console.log("x-vercel-deployment-url:", request.headers.get("x-vercel-deployment-url"));
  console.log("x-vercel-forwarded-for:", request.headers.get("x-vercel-forwarded-for"));
  console.log("Request origin:", request.headers.get("origin") || "no origin");
  console.log("All headers:", Object.fromEntries(request.headers.entries()));
  console.log("=====================================");

  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    console.log("✅ Development mode - allowing request");
    return true;
  }

  // Allow Vercel Cron requests (check multiple possible header formats)
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "1" || vercelCronHeader === "true") {
    console.log("✅ Vercel Cron header detected - allowing request");
    return true;
  }

  // Allow requests with correct API key/secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    console.log("✅ Valid CRON_SECRET - allowing request");
    return true;
  }

  // Allow internal requests (for manual refresh)
  if (userAgent && userAgent.includes("undici")) {
    console.log("✅ Internal request (undici) - allowing request");
    return true;
  }

  // Check if request comes from Vercel infrastructure (backup auth method)
  if (userAgent && userAgent.includes("vercel")) {
    console.log("✅ Vercel infrastructure request - allowing request");
    return true;
  }

  // Allow requests from Vercel deployment URLs
  const vercelDeploymentUrl = request.headers.get("x-vercel-deployment-url");
  if (vercelDeploymentUrl) {
    console.log("✅ Vercel deployment request - allowing request");
    return true;
  }

  console.log("❌ Request not authorized - rejecting");
  return false;
}

export async function POST(request: NextRequest) {
  // Verify the request is authorized
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await updateAnalyticsCache();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cache:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to update cache",
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
