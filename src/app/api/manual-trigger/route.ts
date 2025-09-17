import { NextRequest, NextResponse } from "next/server";
import { updateAnalyticsCache } from "@/lib/cache-update";

export async function POST(request: NextRequest) {
  try {
    console.log("Manual cache trigger requested...");

    // Call the cache update function directly
    const result = await updateAnalyticsCache();

    console.log("Manual cache update successful");

    return NextResponse.json({
      success: true,
      message: "Cache manually updated successfully",
      data: result
    });

  } catch (error) {
    console.error("Manual cache trigger failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Manual cache update failed"
    }, { status: 500 });
  }
}

// Allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}