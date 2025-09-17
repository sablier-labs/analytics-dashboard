import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Manual cache trigger requested...");

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Trigger the update-cache endpoint with cron header
    const response = await fetch(`${baseUrl}/api/update-cache`, {
      method: "POST",
      headers: {
        "x-vercel-cron": "1", // Simulate cron authentication
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Update failed: ${result.error || "Unknown error"}`);
    }

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