import { NextResponse } from "next/server";
import { fetchStreamDurationStats } from "@/lib/services/graphql";

// Test endpoint to verify the stream duration stats query works
export async function GET() {
  try {
    console.log("Testing stream duration stats GraphQL query...");
    
    const durationStats = await fetchStreamDurationStats();
    
    console.log("Stream duration stats fetched successfully");
    
    // Helper function to format duration for display
    function formatDuration(seconds: number): string {
      const days = Math.floor(seconds / 86400);
      if (days >= 365) {
        return `${Math.floor(days / 365)} years`;
      }
      if (days >= 30) {
        return `${Math.floor(days / 30)} months`;
      }
      if (days >= 7) {
        return `${Math.floor(days / 7)} weeks`;
      }
      if (days > 0) {
        return `${days} days`;
      }
      const hours = Math.floor(seconds / 3600);
      return `${hours} hours`;
    }
    
    return NextResponse.json({
      success: true,
      data: durationStats,
      formatted: {
        median: formatDuration(durationStats.median),
        average: formatDuration(durationStats.average),
        min: formatDuration(durationStats.min),
        max: formatDuration(durationStats.max)
      }
    });
  } catch (error) {
    console.error("Error testing stream duration stats:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}