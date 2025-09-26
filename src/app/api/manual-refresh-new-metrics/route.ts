import { NextResponse } from "next/server";

// Simple manual cache refresh endpoint for new metrics - no auth required for development
export async function POST() {
  try {
    console.log("Manual new metrics cache refresh triggered...");

    // Call the update-new-metrics-cache endpoint internally
    const updateResponse = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/update-new-metrics-cache`,
      {
        headers: {
          "Content-Type": "application/json",
          // Skip auth for internal call in development
        },
        method: "POST",
      },
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`New metrics cache update failed: ${updateResponse.status} ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log("Manual new metrics cache refresh completed:", result);

    return NextResponse.json({
      data: result,
      message: "New metrics cache refreshed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in manual new metrics cache refresh:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    );
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST();
}
