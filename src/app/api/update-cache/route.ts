import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateAnalyticsCache } from "@/lib/cache-update";

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const url = new URL(request.url);

  // Allow Vercel Cron requests
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }

  // Allow requests with correct API key
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Allow internal requests (for manual refresh)
  const userAgent = request.headers.get("user-agent");
  if (userAgent && userAgent.includes("undici")) {
    return true;
  }


  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
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
