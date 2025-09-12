import { NextResponse } from "next/server";

// Simple manual cache refresh endpoint - no auth required for development
export async function POST() {
  try {
    console.log("Manual cache refresh triggered...");
    
    // Call the update-cache endpoint internally
    const updateResponse = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/update-cache`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Skip auth for internal call
      },
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Cache update failed: ${updateResponse.status} ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log("Manual cache refresh completed:", result);

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in manual cache refresh:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST();
}