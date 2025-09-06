import { NextResponse } from "next/server";

// TEMPORARY PUBLIC ENDPOINT - REMOVE AFTER CACHE UPDATE!
export async function POST() {
  try {
    console.log("Manual cache update triggered");
    
    // Call the protected update-cache endpoint with cron header
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/update-cache`, {
      method: 'POST',
      headers: {
        'x-vercel-cron': '1',
        'Content-Type': 'application/json'
      },
    });
    
    const result = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result: result,
      message: response.ok ? "Cache update triggered successfully" : "Cache update failed"
    });
  } catch (error) {
    console.error("Manual cache update error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Also support GET for easy browser testing
export async function GET() {
  return POST();
}